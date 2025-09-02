"use client"


import { Component } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { ProfileEdit } from "@/components/dashboard/ProfileEdit"
import { NavigationMenu } from "@/components/dashboard/NavigationMenu"
import { LandingPage } from "@/components/landing/LandingPage"
import { DashboardMain } from "@/components/dashboard/DashboardMain"
import { VehicleRegistration } from "@/components/dashboard/VehicleRegistration"
import { ActivityLogs } from "@/components/dashboard/ActivityLogs";
import { Notification } from "@/components/ui/Notification"
import { authService, profileService } from "@/services/authService"
import { ProfileContainer } from "@/components/dashboard/ProfileContainer"
import { ProfileView } from "@/components/dashboard/ProfileView"
import { User } from "lucide-react"
import { RegisteredVehicles } from "@/components/dashboard/RegisteredVehicles"
import { vehicleService } from "@/services/vehicleService"
import { activityService } from "@/services/activityService"
import { VehicleActivity } from "@/types/auth"
import { webSocketService, WebSocketMessage } from "@/services/websocketService"
import {
  Shield,
  Camera,
  Clock,
  CheckCircle,
  BarChart3,
  Smartphone,
  Users,
  AlertTriangle,
  ArrowRight,
  Menu,
  Mail,
  MapPin,
  Car,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Activity,
} from "lucide-react"

type AppUser = {
  id: string
  name: string
  email: string
  role: "User" | "Security"
  phone?: string;
}

type BackendUser = {
  ID?: string;  // Backend uses uppercase
  id?: string;  // Some APIs use lowercase
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Role?: string;
  role?: string;
  createdAt?: string;
  token?: string;
  // Add other backend fields if needed
}


type Vehicle = {
  id: string;
  plateNumber: string;    // Frontend primary field
  plate_number?: string;  // Optional API field
  model: string;
  color: string;
  type: string;
  status: "Active" | "Inactive";
  userId: string;
  user_id?: string;      // Optional API field
}

type ActivityLog = {
  id: string
  vehiclePlate: string
  vehicleName: string
  logTime: string // Changed from entryTime/exitTime
  logType: 'Entry' | 'Exit' // New field to indicate type
  timestamp?: string // Optional for API compatibility
  is_entry?: boolean // Optional for API compatibility
}

type VehicleSecuritySystemState = {
  currentPage: string
  loginError: string | null;
  currentUser: AppUser | null
  users: AppUser[]
  vehicles: Vehicle[]
  activityLogs: ActivityLog[]
  isMenuOpen: boolean
  loginForm: { email: string; password: string }
  registerForm: { name: string; email: string; password: string }
  profileForm: { name: string; email: string; phone: string; }
  vehicleForm: { plateNumber: string; model: string; color: string; type: string }
  loading: boolean
  notification: {
    show: boolean; message: string; type: 'success' | 'error' | 'info';
  };
  showNotification: boolean;
  notificationMessage: string;
  isEntryNotification: boolean;
  profileLoading: boolean;
  pendingExitActivity?: {  // Add this to track pending exit activities
    plateNumber: string;
    visitorType: 'registered' | 'guest';
    exitPointId?: string;
  };
  webSocketConnected: boolean;
  pendingExitConfirmation?: {
    pending_id: string;
    token: string;
    message: string;
    plateNumber: string;
    vehicleName: string;
  };
}

export default class VehicleSecuritySystem extends Component<{}, VehicleSecuritySystemState> {
  private connectionUnsubscribe?: () => void;
  private messageUnsubscribe?: () => void;
  constructor(props: {}) {
    super(props)
    this.state = {
      loginError: null,
      currentPage: "landing",
      currentUser: null,
      users: [],
      vehicles: [],
      loading: false,
      profileLoading: false,
      activityLogs: [],
      isMenuOpen: false,
      loginForm: { email: "", password: "" },
      registerForm: { name: "", email: "", password: "" },
      profileForm: { name: "", email: "", phone: "" },
      vehicleForm: { plateNumber: "", model: "", color: "", type: "" },

      notification: { show: false, message: '', type: 'info' },

      showNotification: false,
      notificationMessage: "",
      isEntryNotification: true,
      webSocketConnected: false,
    }
  }

  // Add these methods to your class
  toggleNotification = (isEntry: boolean, vehicleData?: { plateNumber: string; vehicleName: string }) => {
    let message: string;

    if (isEntry) {
      message = "Are you the one entering the gate?";
    } else if (vehicleData) {
      message = `Are you the one exiting the gate in ${vehicleData.vehicleName} (${vehicleData.plateNumber})?`;
    } else {
      message = "Are you the one exiting the premises?";
    }

    this.setState({
      showNotification: true,
      isEntryNotification: isEntry,
      notificationMessage: message
    });

    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (this.state.showNotification) {
        this.setState({ showNotification: false });
      }
    }, 30000);
  }

  setNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    this.setState({
      notification: {
        show: true,
        message,
        type
      }
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.setState({
        notification: {
          ...this.state.notification,
          show: false
        }
      });
    }, 5000);
  };

  handleNotificationResponse = async (response: boolean) => {
  const { pendingExitConfirmation } = this.state;
  
  if (pendingExitConfirmation) {
    console.log('Sending WebSocket response:', {
      pending_id: pendingExitConfirmation.pending_id,
      token: pendingExitConfirmation.token,
      confirmed: response
    });

    // Send response via WebSocket - match exact backend structure
    const success = webSocketService.sendMessage({
      type: 'response',
      pending_id: pendingExitConfirmation.pending_id,
      token: pendingExitConfirmation.token,
      confirmed: response
    });

    if (success) {
      this.setNotification(
        response ? "Exit confirmed successfully" : "Exit denied - Security has been notified", 
        response ? 'success' : 'info'
      );
      
      // Log the action for debugging
      console.log(`User ${response ? 'confirmed' : 'denied'} exit for vehicle ${pendingExitConfirmation.plateNumber}`);
      
      // If denied, show additional message
      if (!response) {
        setTimeout(() => {
          this.setNotification("Security personnel have been alerted about the unauthorized exit attempt", 'info');
        }, 2000);
      }
    } else {
      this.setNotification("Failed to send response - connection issue", 'error');
      
      // Try to reconnect if sending failed
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        console.log('Attempting to reconnect WebSocket...');
        webSocketService.reconnect();
      }
    }
  }
  
  // Reset the notification state
  this.setState({ 
    showNotification: false,
    pendingExitConfirmation: undefined
  });
}
  
  // Add this in componentDidMount to simulate notifications:
  componentDidMount() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.connectWebSocket(token);
    }

    if (this.state.currentUser) {
      this.fetchVehicles();
      this.fetchActivities();
    } 
  }

  componentWillUnmount() {
    // Clean up WebSocket subscriptions properly
    if (this.connectionUnsubscribe) {
      this.connectionUnsubscribe();
      this.connectionUnsubscribe = undefined;
    }
    if (this.messageUnsubscribe) {
      this.messageUnsubscribe();
      this.messageUnsubscribe = undefined;
    }
    webSocketService.disconnect();
  }

  componentDidUpdate(prevProps: {}, prevState: VehicleSecuritySystemState) {
    // Only fetch profile if user changed and we have a current user
    if (this.state.currentUser &&
      (!prevState.currentUser ||
        prevState.currentUser.id !== this.state.currentUser.id)) {
      this.fetchProfile();
    }
    if ((!prevState.currentUser && this.state.currentUser) ||
      (prevState.currentPage !== 'activity-logs' &&
        this.state.currentPage === 'activity-logs')) {
      this.fetchVehicles();
      this.fetchActivities();
    }
  }


  handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ loading: true, loginError: null }); // Reset loginError on new attempt

    try {
      const { user, token, error } = await authService.login({
        email: this.state.loginForm.email,
        password: this.state.loginForm.password,
      });

      if (error) {
        console.log(error);
        this.setState({ loginError: error }); // Set loginError for the form
        this.setNotification(error, 'error');
        return;
      }

      if (user && token) {
        const appUser: AppUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        localStorage.setItem('authToken', token);

        this.connectWebSocket(token);

        // First set the user state
        await new Promise<void>((resolve) => {
          this.setState({ 
            currentUser: appUser,
            currentPage: "dashboard"
          }, resolve); // Using callback to ensure state is updated
        });
        
        // Then fetch vehicles
        await this.fetchVehicles();

        this.setNotification('Login successful!', 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      this.setState({ loginError: errorMessage }); // Set loginError for the form
      this.setNotification(errorMessage, 'error');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    const newUser: AppUser = {
      id: Date.now().toString(),
      name: this.state.registerForm.name,
      email: this.state.registerForm.email,
      role: "User",
    }
    this.setState({
      users: [...this.state.users, newUser],
      currentUser: newUser,
      currentPage: "profile",
    })
  }

  handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token || !this.state.currentUser) return;

    this.setState({ loading: true });

    try {
      const { profile, error } = await profileService.updateProfile(
        token,
        this.state.currentUser.id,
        {
          full_name: this.state.profileForm.name,
          phone: this.state.profileForm.phone
        }
      );

      if (error) throw new Error(error);

      if (profile) {
        this.setNotification("Profile updated successfully!", 'success');
        this.setState({
          currentUser: {
            ...this.state.currentUser,
            name: profile.full_name || this.state.currentUser.name
          },
          profileForm: {
            ...this.state.profileForm,
            name: profile.full_name || this.state.profileForm.name,
            phone: profile.phone || this.state.profileForm.phone
          }
        });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      this.setNotification(errorMessage, 'error');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleVehicleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side duplicate check
    
    const token = localStorage.getItem('authToken');
    if (!token || !this.state.currentUser) {
      this.setNotification('Please login first', 'error');
      return;
    }

    console.log('Submitting vehicle:', this.state.vehicleForm); // Debug log


    this.setState({ loading: true });

    try {
      const { vehicle, error } = await vehicleService.registerVehicle(
        token,
        {
          plate_number: this.state.vehicleForm.plateNumber,
          model: this.state.vehicleForm.model,
          color: this.state.vehicleForm.color,
          type: this.state.vehicleForm.type.toLowerCase() as 'bus' | 'car' | 'bike'
        }
      );

      console.log('API Response:', { vehicle, error }); // Debug log


      if (error) {
        // Show the specific error message from the API
        this.setNotification(error, 'error');
        return;
      }


      if (vehicle) {
        this.setState({
          vehicles: [...this.state.vehicles, {
            ...vehicle,
            plateNumber: vehicle.plate_number, // Ensure frontend compatibility
            userId: this.state.currentUser?.id || '',
            status: 'Active'
          }],
          vehicleForm: { plateNumber: "", model: "", color: "", type: "" },
          currentPage: "registered-vehicles"
        });
        this.setNotification("Vehicle registered successfully!", 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Vehicle registration failed';
      this.setNotification(errorMessage, 'error');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleEditVehicle = (vehicleId: string) => {
    const vehicle = this.state.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      this.setState({
        currentPage: "vehicle-registration",
        vehicleForm: {
          plateNumber: vehicle.plateNumber,
          model: vehicle.model,
          color: vehicle.color,
          type: vehicle.type
        }
      });
    }
  };

  handleLogout = () => {
    localStorage.removeItem('authToken');
    this.setState({ 
      currentUser: null,
      currentPage: "landing",
      profileForm: {  // Reset profile form
        name: "",
        email: "",
        phone: "",
      }
    });
  }

  handleExitConfirmation = (message: WebSocketMessage) => {
    if (message.type === 'exit_confirmation' && message.pending_id && message.token) {
      console.log('Processing exit confirmation:', message)
      
      this.setState({
        pendingExitConfirmation: {
          pending_id: message.pending_id,
          token: message.token,
          message: message.message || 'Are you the one exiting the premises?',
          plateNumber: message.plateNumber || 'Unknown', 
          vehicleName: message.vehicleName || 'Unknown Vehicle' 
        }
      }, () => {
        this.showWebSocketNotification()
      })
    }
  }

  connectWebSocket = (token: string) => {
  try {
    // Clean up any existing subscriptions first
    if (this.connectionUnsubscribe) {
      this.connectionUnsubscribe();
      this.connectionUnsubscribe = undefined;
    }
    if (this.messageUnsubscribe) {
      this.messageUnsubscribe();
      this.messageUnsubscribe = undefined;
    }

    console.log('Connecting WebSocket with token...');
    webSocketService.connect(token);
    
    this.connectionUnsubscribe = webSocketService.onConnectionChange((connected) => {
      console.log('WebSocket connection status changed:', connected);
      this.setState({ webSocketConnected: connected });
      
      if (!connected && this.state.currentUser) {
        console.log('WebSocket disconnected, will retry in 5 seconds...');
      }
    });
    
    this.messageUnsubscribe = webSocketService.onMessage((message) => {
      console.log('WebSocket message received in component:', message);
      
      if (message.type === 'exit_confirmation') {
        this.handleExitConfirmation(message);
      }
      
      if (message.type === 'security_alert') {
        this.setNotification(message.message || 'Security alert received', 'info');
      }
    });
    
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    this.setNotification('Connection failed, retrying...', 'error');
  }
}

  extractPlateNumberFromMessage = (message?: string): string | null => {
    if (!message) return null;

    // Try to extract plate number from message (e.g., "Vehicle ABC-123 is exiting")
    const plateMatch = message.match(/[A-Z0-9-]{6,10}/);
    return plateMatch ? plateMatch[0] : null;
  }

  showWebSocketNotification = () => {
      const { pendingExitConfirmation } = this.state
      if (!pendingExitConfirmation) return

      this.setState({
        showNotification: true,
        notificationMessage: pendingExitConfirmation.message,
        isEntryNotification: false
      })
  }

  deleteVehicle = async (vehicleId: string) => {
    const token = localStorage.getItem('authToken');
    if (!token || !this.state.currentUser) {
      this.setNotification('Please login first', 'error');
      return false;
    }

    this.setState({ loading: true });

    try {
      const { success, error } = await vehicleService.deleteVehicle(token, vehicleId);

      if (error) {
        this.setNotification(error, 'error');
        return false;
      }

      if (success) {
        this.setState(prevState => ({
          vehicles: prevState.vehicles.filter(v => v.id !== vehicleId)
        }));
        this.setNotification("Vehicle deleted successfully!", 'success');
        return true;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vehicle';
      this.setNotification(errorMessage, 'error');
      return false;
    } finally {
      this.setState({ loading: false });
    }
  }

  async fetchProfile() {
    const token = localStorage.getItem('authToken');
    if (!token || !this.state.currentUser) return;

    this.setState({ profileLoading: true });

    try {
      const { profile, error } = await profileService.getProfile(
        token,
        this.state.currentUser.id
      );

      if (error) throw new Error(error);

      if (profile) {
        this.setState({
          profileForm: {
            name: profile.full_name || this.state.currentUser.name,
            email: profile.email || this.state.currentUser.email,
            phone: profile.phone || ''
          }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      this.setNotification(errorMessage, 'error');
    } finally {
      this.setState({ profileLoading: false });
    }
  }

  fetchVehicles = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !this.state.currentUser) {
      console.error('Cannot fetch vehicles - no token or user');
      return;
    }

    this.setState({ loading: true });

    try {
      const { vehicles, error } = await vehicleService.getVehicles(token);

      if (error) {
        this.setNotification(error, 'error');
        return;
      }

      if (vehicles) {
        this.setState({
          vehicles: vehicles.map(v => ({
            ...v,
            plateNumber: v.plate_number || v.plateNumber || '',
            userId: this.state.currentUser?.id || '',
            status: v.status || 'Active'
          }))
        });
      }
    } catch (err) {
      console.error('Fetch vehicles error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicles';
      this.setNotification(errorMessage, 'error');
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchActivities = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !this.state.currentUser) return;

    this.setState({ loading: true });

    try {
      const { vehicles, error: vehiclesError } = await vehicleService.getVehicles(token);

      console.log(vehicles)

      if (vehiclesError) {
        this.setNotification(vehiclesError, 'error');
        return;
      }

      if (vehicles && vehicles.length > 0) {
        const allActivities: VehicleActivity[] = [];

        for (const vehicle of vehicles) {
          console.log(`Fetching activities for vehicle ID: ${vehicle.id}`);

          const { activities, error: activitiesError } = await activityService.getVehicleActivities(
            token,
            vehicle.id
          );

          if (activitiesError) {
            console.error(`Error for vehicle ${vehicle.id}:`, activitiesError);
            continue;
          }

          if (activities) {
            console.log(`Found ${activities.length} activities for vehicle ${vehicle.id}`);
            allActivities.push(...activities);
          }
        }

        // Sort activities by timestamp (newest first)
        const sortedActivities = allActivities.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Transform API data to match our UI format
        const transformedLogs: ActivityLog[] = sortedActivities.map(activity => ({
          id: activity.id,
          vehiclePlate: activity.plate_number,
          vehicleName: this.getVehicleName(activity.plate_number) || 'Unknown Vehicle',
          logTime: activity.timestamp,
          logType: activity.is_entry ? 'Entry' as const : 'Exit' as const,
          rawActivity: activity
        }));

        // Update the state with transformed logs
        this.setState({
          activityLogs: transformedLogs
        });

        // Check for exits that need confirmation
        this.checkForExitActivities(sortedActivities);
      }
    } catch (err) {
      console.error('Fetch activities error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activities';
      this.setNotification(errorMessage, 'error');
    } finally {
      this.setState({ loading: false });
    }
  }


  checkForExitActivities = (activities: VehicleActivity[]) => {
    // Look for recent exit activities
    const recentExits = activities.filter(activity =>
      !activity.is_entry &&
      new Date(activity.timestamp).getTime() > Date.now() - 300000 // Last 5 minutes
    );

    if (recentExits.length > 0 && !this.state.showNotification) {
      const latestExit = recentExits[0];
      this.setState({
        pendingExitActivity: {
          plateNumber: latestExit.plate_number,
          visitorType: latestExit.visitor_type,
        }
      });

      // Show notification with vehicle info
      this.toggleNotification(false, {
        plateNumber: latestExit.plate_number,
        vehicleName: this.getVehicleName(latestExit.plate_number) || 'Unknown Vehicle'
      });
    }
  }


  // Helper method to get vehicle name from plate number
  getVehicleName = (plateNumber: string): string => {
    const vehicle = this.state.vehicles.find(v =>
      v.plateNumber === plateNumber || v.plate_number === plateNumber
    );
    return vehicle ? `${vehicle.model} (${vehicle.color})` : 'Unknown Vehicle';
  }


  NavigationMenu = () => {
    const userVehicles = this.state.vehicles.filter((v) => v.userId === this.state.currentUser?.id)

    return (
      <nav className="space-y-2">
        {this.state.currentUser?.role === "User" && (
          <>
            <Button
              variant={this.state.currentPage === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                this.setState({ currentPage: "dashboard", isMenuOpen: false })
              }}
            >
              <Car className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={this.state.currentPage === "vehicle-registration" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                this.setState({ currentPage: "vehicle-registration", isMenuOpen: false })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Register Vehicle
            </Button>
            <Button
              variant={this.state.currentPage === "registered-vehicles" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                this.setState({ currentPage: "registered-vehicles", isMenuOpen: false })
              }}
            >
              <Car className="mr-2 h-4 w-4" />
              My Vehicles
            </Button>
            <Button
              variant={this.state.currentPage === "activity-logs" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                this.setState({ currentPage: "activity-logs", isMenuOpen: false })
              }}
            >
              <Activity className="mr-2 h-4 w-4" />
              Activity Logs
            </Button>
          </>
        )}
        {this.state.currentUser?.role === "Security" && (
          <>
            <Button
              variant={this.state.currentPage === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                this.setState({ currentPage: "dashboard", isMenuOpen: false })
              }}
            >
              <Shield className="mr-2 h-4 w-4" />
              Security Dashboard
            </Button>
            <Button
              variant={this.state.currentPage === "activity-logs" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                this.setState({ currentPage: "activity-logs", isMenuOpen: false })
              }}
            >
              <Activity className="mr-2 h-4 w-4" />
              Monitor Activity
            </Button>
          </>
        )}
        <Button
          variant={this.state.currentPage === "profile" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            this.setState({ currentPage: "profile", isMenuOpen: false }) // Changed to "profile"
          }}
          >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={this.handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </nav>
    )
  }

  renderLandingPage() {
    return (
      <LandingPage
        onNavigateToRegister={() => this.setState({ currentPage: "register" })}
        onNavigateToLogin={() => this.setState({ currentPage: "login" })}
      />
    )
  }

  renderRegisterPage() {
    return (
      <RegisterForm
        onSuccess={() => {
          this.setNotification("Registration successful! Please login.", "success");
          this.setState({ currentPage: "login" });
        }}
        onNavigateToLogin={() => this.setState({ currentPage: "login" })}
        onNavigateToHome={() => this.setState({ currentPage: "landing" })}
      />
    );
  }
  renderLoginPage() {
    return (
      <LoginForm
        email={this.state.loginForm.email}
        password={this.state.loginForm.password}
        loading={this.state.loading}
        error={this.state.loginError} // Pass loginError to LoginForm
        onEmailChange={(email) =>
          this.setState({
            loginForm: { ...this.state.loginForm, email },
            loginError: null, // Clear error on input change
          })
        }
        onPasswordChange={(password) =>
          this.setState({
            loginForm: { ...this.state.loginForm, password },
            loginError: null, // Clear error on input change
          })
        }
        onSubmit={this.handleLogin}
        onNavigateToRegister={() => this.setState({ currentPage: 'register', loginError: null })}
        onNavigateToHome={() => this.setState({ currentPage: 'landing', loginError: null })}
      />
    );
  }

  renderProfilePage() {
    if (!this.state.currentUser) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {this.state.currentUser.role === "Security" ? (
                  <Shield className="h-8 w-8 text-blue-600 mr-3" />
                ) : (
                  <User className="h-8 w-8 text-blue-600 mr-3" />
                )}
                <h1 className="text-xl font-semibold">My Profile</h1>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => this.setState({ currentPage: "dashboard" })}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <ProfileContainer
            currentUser={this.state.currentUser}
            initialData={{
              full_name: this.state.profileForm.name,
              phone: this.state.profileForm.phone
            }}
            onSave={async (data) => {
              this.setState({ profileLoading: true });
              try {
                const token = localStorage.getItem('authToken');
                if (!token || !this.state.currentUser) throw new Error('Not authenticated');

                const { profile, error } = await profileService.updateProfile(
                  token,
                  this.state.currentUser.id,
                  {
                    full_name: data.full_name,
                    phone: data.phone
                  }
                );

                if (error) throw new Error(error);

                this.setState({
                  profileForm: {
                    ...this.state.profileForm,
                    name: profile?.full_name || data.full_name,
                    phone: profile?.phone || data.phone
                  }
                });

                this.setNotification("Profile updated successfully!", 'success');
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
                this.setNotification(errorMessage, 'error');
              } finally {
                this.setState({ profileLoading: false });
              }
            }}
            loading={this.state.profileLoading}
          />
        </main>
      </div>
    );
  }

  renderRegisteredVehiclesPage() {
    if (!this.state.currentUser) return null;

    const userVehicles = this.state.vehicles.filter(
      v => v.userId === this.state.currentUser?.id
    );

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {this.state.currentUser.role === "Security" ? (
                  <Shield className="h-8 w-8 text-blue-600 mr-3" />
                ) : (
                  <User className="h-8 w-8 text-blue-600 mr-3" />
                )}
                <h1 className="text-xl font-semibold">My Profile</h1>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => this.setState({ currentPage: "dashboard" })}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6">
                <this.NavigationMenu />
              </div>
            </aside>

            <main className="flex-1">
              {this.state.loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading vehicles...</p>
                </div>
              ) : (
                <RegisteredVehicles
                  vehicles={this.state.vehicles.filter(v => v.userId === this.state.currentUser?.id)}
                  onEdit={this.handleEditVehicle}
                  onDelete={this.deleteVehicle} // Now async
                  onRegisterNew={() => this.setState({
                    currentPage: "vehicle-registration",
                    vehicleForm: {
                      plateNumber: "",
                      model: "",
                      color: "",
                      type: ""
                    }
                  })}
                  loading={this.state.loading}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Alternative: Use the same header style as Profile and Registered Vehicles
  renderActivityLogsPage() {
    if (!this.state.currentUser) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Expired</h2>
            <Button onClick={this.handleLogout}>Return to Login</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Consistent header with other pages */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {this.state.currentUser.role === "Security" ? (
                  <Shield className="h-8 w-8 text-blue-600 mr-3" />
                ) : (
                  <Activity className="h-8 w-8 text-blue-600 mr-3" />
                )}
                <h1 className="text-xl font-semibold">
                  {this.state.currentUser.role === "Security" ? "Activity Monitor" : "Activity Logs"}
                </h1>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => this.setState({ currentPage: "dashboard" })}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6">
                <NavigationMenu
                  currentPage={this.state.currentPage}
                  currentUser={this.state.currentUser}
                  onPageChange={(page) => this.setState({ currentPage: page })}
                  onLogout={this.handleLogout}
                />
              </div>
            </aside>

            <main className="flex-1">
              {this.state.loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading activities...</p>
                </div>
              ) : (
                <ActivityLogs
                  logs={this.state.activityLogs} // This should now have the fetched data
                  userRole={this.state.currentUser.role}
                  onNavigateToVehicle={(plate) => {
                    this.setState({
                      currentPage: "registered-vehicles",
                    });
                  }}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }

  renderNotification() {
    if (!this.state.showNotification) return null;

    return (
      <div className={`
        fixed bottom-0 left-0 right-0 transform translate-y-full
        animate-slide-up z-50 max-w-md mx-auto mb-8
      `}>
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {this.state.notificationMessage}
          </h3>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => this.handleNotificationResponse(true)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
            >
              Yes
            </Button>
            <Button
              onClick={() => this.handleNotificationResponse(false)}
              variant="outline"
              className="px-6 py-2 border-red-600 text-red-600 hover:bg-red-50"
            >
              No
            </Button>
          </div>
        </div>
      </div>
    );
  }

  renderVehicleRegistrationPage() {
    return (
      <VehicleRegistration
        formData={this.state.vehicleForm}
        onPlateNumberChange={(plateNumber) =>
          this.setState({ vehicleForm: { ...this.state.vehicleForm, plateNumber } })
        }
        onModelChange={(model) =>
          this.setState({ vehicleForm: { ...this.state.vehicleForm, model } })
        }
        onColorChange={(color) =>
          this.setState({ vehicleForm: { ...this.state.vehicleForm, color } })
        }
        onTypeChange={(type) =>
          this.setState({ vehicleForm: { ...this.state.vehicleForm, type } })
        }
        onSubmit={this.handleVehicleRegistration}
        onCancel={() => this.setState({ currentPage: "dashboard" })}
      />
    );
  }

  renderDashboard() {
    const userVehicles = this.state.vehicles.filter((v) => v.userId === this.state.currentUser?.id)

    // Get the 3 most recent activities
    const recentActivities = this.state.activityLogs.slice(0, 3);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Sheet open={this.state.isMenuOpen} onOpenChange={(open) => this.setState({ isMenuOpen: open })}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64">
                    <div className="flex items-center mb-6">
                      <Car className="h-8 w-8 text-blue-600 mr-3" />
                      <h1 className="text-xl font-semibold">Vehicle Monitor</h1>
                    </div>
                    {this.state.currentUser && (
                      <NavigationMenu
                        currentPage={this.state.currentPage}
                        currentUser={this.state.currentUser}
                        onPageChange={(page) => this.setState({ currentPage: page, isMenuOpen: false })}
                        onLogout={this.handleLogout}
                      />
                    )}
                  </SheetContent>
                </Sheet>
                <Car className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold">Vehicle Monitor</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">
                  {this.state.currentUser?.role === "Security" ? (
                    <Shield className="h-3 w-3 mr-1" />
                  ) : (
                    <Car className="h-3 w-3 mr-1" />
                  )}
                  {this.state.currentUser?.role}
                </Badge>
                <span className="text-sm text-gray-600 hidden sm:block">{this.state.currentUser?.name}</span>
                <Button variant="ghost" onClick={this.handleLogout} className="hidden sm:flex">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6">
                <this.NavigationMenu />
              </div>
            </aside>

            {/* Main Content */}
          <main className="flex-1">
            <DashboardMain
              userRole={this.state.currentUser?.role || "User"}
              userVehiclesCount={userVehicles.length}
              activeSessionsCount={this.state.activityLogs.filter(log => log.logType === 'Entry').length}
              totalVehiclesCount={this.state.vehicles.length}
              recentActivities={recentActivities} // Pass the recent activities
              onNavigate={(page) => this.setState({ currentPage: page })}
            />
          </main>
          </div>
        </div>
        {this.renderNotification()}
      </div>
    )
  }

  renderWebSocketStatus() {
    return (
      <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
        this.state.webSocketConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {this.state.webSocketConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    );
  }

  testWebSocketMessage = () => {
    const testMessage: WebSocketMessage = {
      type: 'exit_confirmation',
      pending_id: 'test-pending-123',
      token: 'test-token-456',
      message: 'Vehicle ABC-123 is exiting the premises. Are you the driver?'
    };
    
    this.handleExitConfirmation(testMessage);
  }



  render() {
    const currentPage = this.renderCurrentPage();

    return (
      <>
        {currentPage}
        {this.renderWebSocketStatus()}
        {this.state.showNotification && (
          <Notification
            message={this.state.notificationMessage}
            type="info"
            onClose={() => this.setState({
              showNotification: false,
              pendingExitConfirmation: undefined
            })}
            onConfirm={this.state.pendingExitConfirmation ? this.handleNotificationResponse : undefined}
            show={this.state.showNotification}
            isExitConfirmation={!!this.state.pendingExitConfirmation}
          />
        )}
      </>
    );
  }

  // Add this helper method:
  renderCurrentPage = () => {
    switch (this.state.currentPage) {
      case "landing":
        return this.renderLandingPage();
      case "register":
        return this.renderRegisterPage();
      case "login":
        return this.renderLoginPage();
      case "profile":
        return this.renderProfilePage();
      case "vehicle-registration":
        return this.renderVehicleRegistrationPage();
      case "activity-logs":
        return this.renderActivityLogsPage();
      case "registered-vehicles":
        return this.renderRegisteredVehiclesPage();
      default:
        return this.renderDashboard();
    }
  }
}