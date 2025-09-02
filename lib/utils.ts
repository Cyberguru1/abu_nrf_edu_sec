import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Vehicle } from "@/types/auth"

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "User" | "Security";
  phone?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const transformVehicle = (apiVehicle: any): Vehicle => {
  return {
    ...apiVehicle,
    // Ensure all required fields are present
    id: apiVehicle.id || '',
    plate_number: apiVehicle.plate_number || apiVehicle.plateNumber || '',
    model: apiVehicle.model || '',
    color: apiVehicle.color || '',
    type: apiVehicle.type || 'car',
    user_id: apiVehicle.user_id || apiVehicle.userId || '',
    
    // Add frontend aliases
    plateNumber: apiVehicle.plate_number || apiVehicle.plateNumber,
    userId: apiVehicle.user_id || apiVehicle.userId
  };
};

// Add to /lib/utils.ts
export interface AppState {
  currentPage: string;
  currentUser: AppUser | null;
  loginForm: { email: string; password: string };
  registerForm: { name: string; email: string; password: string };
  profileForm: { name: string; email: string; phone: string };
  vehicleForm: { plateNumber: string; model: string; color: string; type: string };
}

export const statePersistence = {
  // Save state to localStorage
  saveState: (state: Partial<AppState>) => {
    try {
      const stateToSave = {
        currentPage: state.currentPage,
        currentUser: state.currentUser,
        loginForm: state.loginForm,
        registerForm: state.registerForm,
        profileForm: state.profileForm,
        vehicleForm: state.vehicleForm,
      };
      localStorage.setItem('appState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  },

  // Load state from localStorage
  loadState: (): Partial<AppState> => {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
    return {};
  },

  // Clear state from localStorage
  clearState: () => {
    try {
      localStorage.removeItem('appState');
    } catch (error) {
      console.error('Error clearing state from localStorage:', error);
    }
  }
};