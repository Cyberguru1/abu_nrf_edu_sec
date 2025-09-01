export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

const API_BASE_URL = 'https://surveilx-backend-fgpe.onrender.com/api/v1';

// /lib/api.ts
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    },
    credentials: 'include' // If using cookies
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};