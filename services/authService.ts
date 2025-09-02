// /services/authService.ts
import { env } from '@/config/config';
import { User, RegisterData, LoginData, Profile } from '@/types/auth';


interface BackendUser {
  ID?: string;
  id?: string;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Role?: string;
  role?: string;
  token?: string;
  createdAt?: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "User" | "Security";
  token?: string;
}


// Type conversion utility
const convertToAppUser = (backendUser: any): AppUser => {
  return {
    id: backendUser.ID || backendUser.id || '',
    name: backendUser.Name || backendUser.name || '',
    email: backendUser.Email || backendUser.email || '',
    role: (backendUser.Role || backendUser.role || 'User') as "User" | "Security",
    // Map other fields as needed
  };
};

export const authService = {
  async register(data: RegisterData): Promise<{ user?: User; error?: string }> {
    // 1. Prepare payload with backend's exact expected format
    const payload = {
      Name: data.name.trim(),  // Try lowercase if 'Name' fails
      Email: data.email.trim().toLowerCase(),
      Password: data.password,
      Role: 'user',  // Try 'resident' or empty if needed
      ConfirmPassword: data.password  // Some APIs require this
    };

    // 2. Enhanced request configuration
    try {
      const response = await fetch(`${env.API_BASE_URL}/auth/register`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'X-API-Key': 'your-public-key-if-required' // Check backend docs
        },
        credentials: 'omit', // Start without credentials
        body: JSON.stringify(payload)
      });

      // 3. Detailed error handling
      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorDetails = response.statusText;
        }
        
        console.error('Registration failed:', {
          status: response.status,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          error: errorDetails
        });

        return { 
          error: `Registration failed (${response.status}): ${errorDetails}` 
        };
      }

      // 4. Flexible response parsing
      const responseData = await response.json();
      return {
        user: {
          ID: responseData.data?.id || responseData.id,
          name: responseData.data?.name || responseData.name,
          email: responseData.data?.email || responseData.email,
          role: responseData.data?.role || responseData.role || 'user',
          token: responseData.data?.token || responseData.token,
          createdAt: responseData.data?.createdAt || responseData.created_at
        }
      };
    } catch (error) {
      console.error('Network error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network failure' 
      };
    }
  },
   async login(credentials: LoginData): Promise<{ user?: AppUser; token?: string; error?: string }> {
    const payload = {
      Email: credentials.email.trim(),
      Password: credentials.password
    };

    try {
      const response = await fetch(`${env.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        return { 
          error: responseData.error || 'Login failed..' 
        };
      }

      // Return the converted user and token
      return {
        token: responseData.token || responseData.data?.token,
        user: convertToAppUser(responseData.user || responseData.data)
      };
    } catch (error) {
      return { error: 'Network error' };
    }
  }
};


export const profileService = {
  async getProfile(token: string, userId: string): Promise<{ profile?: Profile; error?: string }> {
    try {
      const response = await fetch(`${env.API_BASE_URL}/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Failed to fetch profile' };
      }

      const profileData = await response.json();
      return { 
        profile: {
          profile_id: profileData.data.profile_id,
          full_name: profileData.data.full_name,
          username: profileData.data.username,
          phone: profileData.data.phone,
          user_id: profileData.data.user_id,
          created_at: profileData.data.created_at,
          updated_at: profileData.data.updated_at
        }
      };

    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  },

  async updateProfile(
    token: string,
    userId: string,
    updateData: {
      full_name?: string;
      phone?: string;
    }
  ): Promise<{ profile?: Profile; error?: string }> {
    try {
      const response = await fetch(`${env.API_BASE_URL}/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updateData,
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Profile update failed' };
      }

      const responseData = await response.json();
      
      // Handle both possible response structures
      const profileData = responseData.data || responseData;
      
      return { 
        profile: {
          profile_id: profileData.profile_id || '',
          full_name: profileData.full_name || '',
          username: profileData.username || '',
          phone: profileData.phone || '',
          user_id: profileData.user_id || userId,
          created_at: profileData.created_at || new Date().toISOString(),
          updated_at: profileData.updated_at || new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }
};