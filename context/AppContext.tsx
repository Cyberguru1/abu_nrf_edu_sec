"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, profileService } from '@/services/authService';
import { vehicleService } from '@/services/vehicleService';
import { activityService } from '@/services/activityService';
import { webSocketService, WebSocketMessage } from '@/services/websocketService';
import { VehicleActivity, RegisterData } from '@/types/auth';

// Type definitions
export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "User" | "Security";
  phone?: string;
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  plate_number?: string;
  model: string;
  color: string;
  type: string;
  status: "Active" | "Inactive";
  userId: string;
  user_id?: string;
};

export type ActivityLog = {
  id: string;
  vehiclePlate: string;
  vehicleName: string;
  logTime: string;
  logType: 'Entry' | 'Exit';
  timestamp?: string;
  is_entry?: boolean;
  gate_name: string;
};

interface AppContextState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentUser: AppUser | null;
  login: (credentials: any) => Promise<string | undefined>;
  logout: () => void;
  vehicles: Vehicle[];
  addVehicle: (vehicleData: any) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<boolean>;
  fetchVehicles: () => Promise<void>;
  activityLogs: ActivityLog[];
  fetchActivities: () => Promise<void>;
  notification: { show: boolean; message: string; type: 'success' | 'error' | 'info' };
  setNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  webSocketConnected: boolean;
  loading: boolean;
  profileLoading: boolean;
  fetchProfile: () => Promise<void>;
  profileForm: { name: string; email: string; phone: string; };
  setProfileForm: (form: any) => void;
  updateProfile: (data: any) => Promise<void>;
  register: (data: RegisterData) => Promise<string | undefined>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const { user, error } = await authService.getMe(token);
        if (user) {
          setCurrentUser(user);
          setCurrentPage('dashboard');
          connectWebSocket(token);
          fetchVehicles();
        } else {
          localStorage.removeItem('authToken');
        }
      }
    };
    validateToken();
  }, []);

  const setNotificationWrapper = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
  };

  const login = async (credentials: any) => {
    setLoading(true);
    const { user, token, error } = await authService.login(credentials);
    setLoading(false);
    if (error) {
      setNotificationWrapper(error, 'error');
      return error;
    }
    if (user && token) {
      const appUser: AppUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      localStorage.setItem('authToken', token);
      setCurrentUser(appUser);
      setCurrentPage('dashboard');
      connectWebSocket(token);
      fetchVehicles();
      setNotificationWrapper('Login successful!', 'success');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setCurrentPage('landing');
    webSocketService.disconnect();
  };

  const fetchVehicles = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setLoading(true);
    const { vehicles, error } = await vehicleService.getVehicles(token);
    setLoading(false);
    if (error) {
      setNotificationWrapper(error, 'error');
      return;
    }
    if (vehicles) {
      setVehicles(vehicles.map(v => ({
        ...v,
        plateNumber: v.plate_number || v.plateNumber || '',
        userId: currentUser?.id || '',
        status: v.status || 'Active'
      })));
    }
  };

  const addVehicle = async (vehicleData: any) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotificationWrapper('Please login first', 'error');
      return;
    }
    setLoading(true);
    const { vehicle, error } = await vehicleService.registerVehicle(token, vehicleData);
    setLoading(false);
    if (error) {
      setNotificationWrapper(error, 'error');
      return;
    }
    if (vehicle) {
      setVehicles(prev => [...prev, {
        ...vehicle,
        plateNumber: vehicle.plate_number,
        userId: currentUser?.id || '',
        status: 'Active'
      }]);
      setCurrentPage('registered-vehicles');
      setNotificationWrapper('Vehicle registered successfully!', 'success');
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotificationWrapper('Please login first', 'error');
      return false;
    }
    setLoading(true);
    const { success, error } = await vehicleService.deleteVehicle(token, vehicleId);
    setLoading(false);
    if (error) {
      setNotificationWrapper(error, 'error');
      return false;
    }
    if (success) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      setNotificationWrapper('Vehicle deleted successfully!', 'success');
      return true;
    }
    return false;
  };

  const fetchActivities = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotificationWrapper('Please login first', 'error');
      return;
    }
    setLoading(true);

    const { vehicles, error: vehiclesError } = await vehicleService.getVehicles(token);
    if (vehiclesError) {
      setNotificationWrapper(vehiclesError, 'error');
      setLoading(false);
      return;
    }

    if (!vehicles || vehicles.length === 0) {
      setActivityLogs([]);
      setLoading(false);
      return;
    }

    const allActivities: VehicleActivity[] = [];
    for (const vehicle of vehicles) {
      const { activities, error: activitiesError } = await activityService.getVehicleActivities(token, vehicle.id);
      if (activitiesError) {
        setNotificationWrapper(`Failed to fetch activities for ${vehicle.plate_number}: ${activitiesError}`, 'error');
        continue;
      }
      if (activities) {
        allActivities.push(...activities);
      }
    }

    const sortedActivities = allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const transformedLogs: ActivityLog[] = sortedActivities.map((activity) => ({
      id: activity.id,
      vehiclePlate: activity.plate_number,
      vehicleName: 'Unknown Vehicle', // This needs to be resolved
      logTime: activity.timestamp,
      logType: activity.is_entry ? 'Entry' : 'Exit',
      gate_name: activity.gate_name,
    }));
    setActivityLogs(transformedLogs);
    setLoading(false);
  };

  const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token || !currentUser) return;

      setProfileLoading(true);
      try {
        const { profile, error } = await profileService.getProfile(token, currentUser.id);
        if (error) throw new Error(error);
        if (profile) {
          setProfileForm({
            name: profile.full_name || currentUser.name,
            email: profile.email || currentUser.email,
            phone: profile.phone || ''
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setNotification(errorMessage, 'error');
      } finally {
        setProfileLoading(false);
      }
  };

  const updateProfile = async (data: any) => {
    const token = localStorage.getItem('authToken');
    if (!token || !currentUser) return;

    setProfileLoading(true);
    try {
        const {profile, error} = await profileService.updateProfile(token, currentUser.id, {
            full_name: data.full_name,
            phone: data.phone
        });

        if (error) throw new Error(error);

        if (profile) {
            setProfileForm({
                ...profileForm,
                name: profile?.full_name || data.full_name,
                phone: profile?.phone || data.phone
            });
            setNotification("Profile updated successfully!", 'success');
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
        setNotification(errorMessage, 'error');
    } finally {
        setProfileLoading(false);
    }
};


  const connectWebSocket = (token: string) => {
    webSocketService.connect(token);
    webSocketService.onConnectionChange(setWebSocketConnected);
    webSocketService.onMessage((message: WebSocketMessage) => {
      if (message.type === 'exit_confirmation') {
        // Handle exit confirmation
        setNotificationWrapper(message.message || 'Exit confirmation requested', 'info');
      } else if (message.type === 'security_alert') {
        setNotificationWrapper(message.message || 'Security alert!', 'error');
      }
    });
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    const { user, error } = await authService.register(data);
    setLoading(false);
    if (error) {
      setNotificationWrapper(error, 'error');
      return error;
    }
    if (user && user.token) {
        const appUser: AppUser = {
            id: user.ID || '',
            name: user.name,
            email: user.email,
            role: user.role as "User" | "Security",
        };
      localStorage.setItem('authToken', user.token);
      setCurrentUser(appUser);
      setCurrentPage('dashboard');
      connectWebSocket(user.token);
      fetchVehicles();
      setNotificationWrapper('Registration successful!', 'success');
    }
  };

  const value = {
    currentPage,
    setCurrentPage,
    currentUser,
    login,
    logout,
    vehicles,
    addVehicle,
    deleteVehicle,
    fetchVehicles,
    activityLogs,
    fetchActivities,
    notification,
    setNotification: setNotificationWrapper,
    webSocketConnected,
    loading,
    profileLoading,
    fetchProfile,
    profileForm,
    setProfileForm,
    updateProfile,
    register,
    updateVehicle: async () => {} // Placeholder for updateVehicle
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};