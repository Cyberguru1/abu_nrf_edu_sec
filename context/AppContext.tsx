"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService, profileService } from '@/services/authService';
import { vehicleService } from '@/services/vehicleService';
import { activityService } from '@/services/activityService';
import { useUserWebSocket } from '@/hooks/useUserWebSocket';
import { VehicleActivity, RegisterData } from '@/types/auth';
import { env } from '@/config/config';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "User" | "Security";
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
  logTime: string;
  logType: 'Entry' | 'Exit';
  timestamp?: string;
  is_entry?: boolean;
  gate_name: string;
  model?: string;
};

export type PageType = 'landing' | 'login' | 'register' | 'dashboard';

interface AppContextState {
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
  webSocketStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  loading: boolean;
  profileLoading: boolean;
  fetchProfile: () => Promise<void>;
  profileForm: { name: string; email: string; phone: string; };
  setProfileForm: (form: any) => void;
  updateProfile: (data: any) => Promise<void>;
  register: (data: RegisterData) => Promise<string | undefined>;
  isInitializing: boolean;
  exitConfirmation: {
    isOpen: boolean;
    message: string;
    pendingId: string;
    token: string;
  };
  handleConfirmExit: () => void;
  handleCancelExit: () => void;
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [isInitializing, setIsInitializing] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('landing');

  // Use the WebSocket hook
  const {
    isConnected: webSocketConnected,
    connectionStatus: webSocketStatus,
    exitConfirmation: wsExitConfirmation,
    securityAlerts,
    sendResponse,
    clearExitConfirmation,
    clearSecurityAlert,
  } = useUserWebSocket(env.WS_URL, authToken);

  // Convert WebSocket exit confirmation to local state format
  const [exitConfirmation, setExitConfirmation] = useState({
    isOpen: false,
    message: '',
    pendingId: '',
    token: '',
  });

  // Sync WebSocket exit confirmation with local state
  useEffect(() => {
    if (wsExitConfirmation) {
      setExitConfirmation({
        isOpen: true,
        message: wsExitConfirmation.message,
        pendingId: wsExitConfirmation.pending_id,
        token: wsExitConfirmation.token,
      });
    }
  }, [wsExitConfirmation]);

  // Handle security alerts
  useEffect(() => {
    if (securityAlerts.length > 0) {
      securityAlerts.forEach((alert, index) => {
        setNotificationWrapper(alert, 'error');
        clearSecurityAlert(index);
      });
    }
  }, [securityAlerts]);

  // Timer for exit confirmation dialog
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (exitConfirmation.isOpen) {
      timeoutId = setTimeout(() => {
        setExitConfirmation({ isOpen: false, message: '', pendingId: '', token: '' });
        clearExitConfirmation();
      }, 20000); // 20 seconds
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [exitConfirmation.isOpen, clearExitConfirmation]);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const { user, error } = await authService.getMe(token);
        if (user) {
          setCurrentUser(user);
          setAuthToken(token); // This will trigger WebSocket connection
          fetchVehicles();
        } else {
          localStorage.removeItem('authToken');
        }
      }
      setIsInitializing(false);
    };
    validateToken();
  }, []);

  // Redirect logic based on auth state
  useEffect(() => {
    if (isInitializing) return;

    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!currentUser && !isPublicRoute) {
      router.push('/login');
    } else if (currentUser && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
  }, [currentUser, pathname, isInitializing, router]);

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
      setAuthToken(token); // This will trigger WebSocket connection
      router.push('/dashboard');
      fetchVehicles();
      setNotificationWrapper('Login successful!', 'success');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setAuthToken(null); // This will disconnect WebSocket
    router.push('/');
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
      router.push('/registered-vehicles');
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
      vehicleName: activity.model,
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
        setNotification({
          show: true,
          message: errorMessage,
          type: 'error'
        }); 
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
            setNotification({
              show: true,
              message: "Profile updated successfully!",
              type: 'success'
            });
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
        setNotification({
          show: true,
          message: errorMessage,
          type: 'error'
        });
    } finally {
        setProfileLoading(false);
    }
  };

  const handleConfirmExit = () => {
    console.log('✅ Confirming exit:', exitConfirmation.pendingId);
    sendResponse(exitConfirmation.pendingId, exitConfirmation.token, true);
    setExitConfirmation({ isOpen: false, message: '', pendingId: '', token: '' });
    clearExitConfirmation();
  };

  const handleCancelExit = () => {
    console.log('❌ Canceling exit:', exitConfirmation.pendingId);
    sendResponse(exitConfirmation.pendingId, exitConfirmation.token, false);
    setExitConfirmation({ isOpen: false, message: '', pendingId: '', token: '' });
    clearExitConfirmation();
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
      setAuthToken(user.token); // This will trigger WebSocket connection
      router.push('/dashboard');
      fetchVehicles();
      setNotificationWrapper('Registration successful!', 'success');
    }
  };

  const value = {
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
    webSocketStatus,
    loading,
    profileLoading,
    fetchProfile,
    profileForm,
    setProfileForm,
    updateProfile,
    register,
    isInitializing,
    exitConfirmation,
    handleConfirmExit,
    handleCancelExit,
    currentPage,
    setCurrentPage,
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