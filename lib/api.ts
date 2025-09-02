import { env } from '../config/config';

const API_BASE_URL = env.API_BASE_URL;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const api = {
  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${env.API_BASE_URL}${endpoint}`, {
      const response = await fetch(`${env.API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  // We'll add other methods (get, put, delete) as needed
};