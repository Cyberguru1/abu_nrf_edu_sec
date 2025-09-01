// services/activityService.ts
import { VehicleActivity } from '@/types/auth';

const API_BASE_URL = 'https://surveilx-backend-fgpe.onrender.com/api/v1';

export const activityService = {
  async getVehicleActivities(
  token: string,
  vehicleId: string
): Promise<{ activities?: VehicleActivity[]; error?: string }> {
  try {
    console.log(`Fetching activities for vehicle: ${vehicleId}`);
    
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/activities`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      return { error: errorData.message || `Failed to fetch vehicle activities (${response.status})` };
    }

    const responseData = await response.json();
    console.log('Activities response:', responseData);
    return { activities: responseData.data || responseData };
  } catch (error) {
    console.error('Get vehicle activities error:', error);
    return { error: 'Network error' };
  }
},
};