// /types/auth.ts
// types/auth.ts
export interface User {
  // Required fields
  ID: string;
  name: string;
  email: string;
  role: string;
  token: string;
  createdAt: string;
  
  // Optional fields
  deletedAt?: string | null;
  updatedAt?: string;
  lastLogin?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  status_code: number;
  message: string;
  data: User;
  token?: string;
  user?: User;
  error?: string;
}

export interface Profile {
  profile_id: string;
  full_name: string;  // Changed from Full_name to full_name
  username: string;
  phone: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface UpdateProfileData {
  Full_name?: string;
  Phone?: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;  // Matches API response
  model: string;
  color: string;
  type: 'bus' | 'car' | 'bike';
  status?: 'Active' | 'Inactive';
  user_id?: string;      // Matches API response
  
  // Frontend convenience properties
  plateNumber?: string;  // Optional frontend alias
  userId?: string;       // Optional frontend alias
  createdAt?: string;    // Optional for frontend display
}

export interface VehicleActivity {
  id: string;
  plate_number: string;
  visitor_type: 'registered' | 'guest';
  vehicle_id?: string;
  user_id?: string;
  is_entry: boolean;
  gate_name: string;
  vehicle_type: 'bus' | 'car' | 'bike';
  entry_point_id?: string;
  exit_point_id?: string;
  registered_by?: string;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
  model?: string;
}

export interface LogVehicleActivityInput {
  plate_number: string;
  visitor_type: 'registered' | 'guest';
  is_entry: boolean;
  entry_point_id?: string | null;  // Add | null
  exit_point_id?: string | null;   // Add | null
}