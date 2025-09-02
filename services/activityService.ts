// services/activityService.ts
import { env } from '@/config/config';
import { VehicleActivity } from '@/types/auth';


const API_BASE_URL = env.API_BASE_URL;
export const activityService = {
  async getVehicleActivities(
    token: string,
    vehicleId: string
  ): Promise<{ activities?: VehicleActivity[]; error?: string }> {
    try {
      console.log(`Fetching activities for vehicle: ${vehicleId}`);

      const response = await fetch(`${env.API_BASE_URL}/vehicles/${vehicleId}/activities`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `Failed to fetch vehicle activities (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        console.error('Error response:', errorMessage);
        return { error: errorMessage };
      }

      const responseData = await response.json();
      const activities = Array.isArray(responseData.data.data)
        ? responseData.data.data
        : Array.isArray(responseData)
          ? responseData
          : [];

      console.log(`Fetched ${activities.length} activities for vehicle ${vehicleId}`);
      return { activities: activities as VehicleActivity[] };
    } catch (error) {
      console.error('Get vehicle activities error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { error: errorMessage };
    }
  },
};