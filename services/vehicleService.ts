import { Vehicle } from '@/types/auth';
import { transformVehicle } from '@/lib/utils';

const API_BASE_URL = 'https://surveilx-backend-fgpe.onrender.com/api/v1';


export const vehicleService = {
  async registerVehicle(
    token: string,
    vehicleData: {
      plate_number: string;
      model: string;
      color: string;
      type: 'bus' | 'car' | 'bike';
    }
  ): Promise<{ vehicle?: Vehicle; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/register`, { // Updated endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleData)
      });

       if (!response.ok) {
            const errorData = await response.json();
            // Handle 409 Conflict specifically
            if (response.status === 409) {
                return { error: 'This vehicle plate number is already registered' };
            }
            return { error: errorData.message || 'Vehicle registration failed' };
        }

      const responseData = await response.json();
      return { 
        vehicle: {
          ...responseData.data || responseData,
          plateNumber: (responseData.data?.plate_number || responseData.plate_number) // Map to frontend field
        }
      };
    } catch (error) {
      console.error('Vehicle registration error:', error);
      return { error: 'Network error' };
    }
  },
  async getVehicles(token: string): Promise<{ vehicles?: Vehicle[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/fetch_vehicles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Failed to fetch vehicles' };
      }

      const responseData = await response.json();
      
      // Transform API response to match frontend Vehicle type
      const vehicles = (responseData.data || responseData).map((vehicle: any) => ({
        ...vehicle,
        plateNumber: vehicle.plate_number || vehicle.plateNumber,
        status: vehicle.status || 'Active' // Default status
      }));

      return { vehicles };
    } catch (error) {
      console.error('Get vehicles error:', error);
      return { error: 'Network error' };
    }
  },
  async deleteVehicle(
    token: string,
    vehicleId: string
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/deregister/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Failed to delete vehicle' };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete vehicle error:', error);
      return { error: 'Network error' };
    }
  },
};