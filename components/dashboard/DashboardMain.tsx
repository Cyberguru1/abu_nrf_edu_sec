import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Activity, Shield, Plus, User, Clock, LogIn, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardDescription } from "@/components/ui/card";

interface ActivityLog {
  id: string;
  vehiclePlate: string;
  vehicleName: string;
  logTime: string;
  logType: 'Entry' | 'Exit';
  gate_name: string;
}

interface DashboardMainProps {
  userRole: "User" | "Security";
  userVehiclesCount: number;
  activeSessionsCount: number;
  totalVehiclesCount?: number;
  userStation?: string;
  recentActivities?: ActivityLog[];
  onNavigate: (page: string) => void;
}

export const DashboardMain = ({
  userRole,
  userVehiclesCount,
  activeSessionsCount,
  totalVehiclesCount,
  userStation,
  recentActivities = [],
  onNavigate
}: DashboardMainProps) => {

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getLogTypeIcon = (logType: 'Entry' | 'Exit') => {
    return logType === 'Entry' ? <LogIn className="h-3 w-3 mr-1" /> : <LogOut className="h-3 w-3 mr-1" />;
  };

  const getLogTypeVariant = (logType: 'Entry' | 'Exit') => {
    return logType === 'Entry' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === "Security" ? "Security Dashboard" : "Dashboard"}
        </h2>
        <p className="text-gray-600">
          {userRole === "Security"
            ? "Monitor all vehicle activities"
            : "Manage your registered vehicles and access"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User-specific cards */}
        {userRole === "User" && (
          <>
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate("registered-vehicles")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registered Vehicles</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userVehiclesCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tap to view/manage vehicles
                </p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate("registered-vehicles")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">View All Vehicles</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userVehiclesCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tap to view all your vehicles
                </p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate("activity-logs")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSessionsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current active entries
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Security-specific cards */}
        {userRole === "Security" && (
          <>
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate("registered-vehicles")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVehiclesCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All registered vehicles
                </p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate("activity-logs")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Entries</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSessionsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Vehicles currently on campus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Station</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{userStation || "Not Set"}</div>
                {userStation && (
                  <Badge variant="secondary" className="mt-2">
                    Currently Active
                  </Badge>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Quick Actions Card (Common) */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <button
              onClick={() => onNavigate("vehicle-registration")}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Plus className="h-5 w-5 text-blue-600" />
              <span>Register New Vehicle</span>
            </button>
            <button
              onClick={() => onNavigate("registered-vehicles")}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Car className="h-5 w-5 text-blue-600" />
              <span>View My Vehicles</span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {userRole === "Security"
              ? "Latest vehicle movements across campus"
              : "Your recent access history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${activity.logType === 'Entry' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                      {activity.logType === 'Entry' ? (
                        <LogIn className="h-4 w-4 text-green-600" />
                      ) : (
                        <LogOut className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{activity.vehicleName}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.vehiclePlate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">
                      {formatDateTime(activity.logTime)}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {activity.gate_name}
                    </Badge>
                    <Badge
                      variant={getLogTypeVariant(activity.logType)}
                      className="text-xs mt-0"
                    >
                      {getLogTypeIcon(activity.logType)}
                      {activity.logType}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No recent activity found</p>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => onNavigate("activity-logs")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View full activity logs
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};