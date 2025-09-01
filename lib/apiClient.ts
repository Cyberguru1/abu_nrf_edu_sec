import { env } from '../config/config';

import { env } from '../config/config';


// /lib/apiClient.ts
const API_BASE_URL = env.API_BASE_URL;
const API_BASE_URL = env.API_BASE_URL;

export const apiClient = {
  async get(url: string) {
    return this.fetch(url, 'GET');
  },

  async post(url: string, body: any) {
    return this.fetch(url, 'POST', body);
  },

  async fetch(url: string, method: string, body?: any) {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (response.status === 401) {
      // Handle token expiration
      localStorage.removeItem('authToken');
      window.location.reload();
      throw new Error('Session expired');
    }

    return response.json();
  }
};