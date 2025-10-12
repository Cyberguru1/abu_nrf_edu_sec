"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Car, LogOut, Menu, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from '@/context/AppContext';
import { DashboardMain } from '../dashboard/DashboardMain';
import { NavigationMenu } from '../dashboard/NavigationMenu';
import { ConnectivityIndicator } from '../ui/ConnectivityIndicator';

export const DashboardPage = () => {
  const router = useRouter();
  const { currentUser, vehicles, activityLogs, fetchVehicles, fetchActivities, logout, webSocketConnected } = useAppContext();

  useEffect(() => {
    fetchVehicles();
    fetchActivities();
  }, []);

  const userVehicles = vehicles.filter((v) => v.userId === currentUser?.id);
  const recentActivities = activityLogs.slice(0, 3);

  const handleNavigate = (path: string) => {
    router.push(`/${path}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sheet>
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
                  {currentUser && (
                    <NavigationMenu
                      currentPage="dashboard"
                      currentUser={currentUser}
                      onPageChange={handleNavigate}
                      onLogout={logout}
                    />
                  )}
                </SheetContent>
              </Sheet>
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold">Vehicle Monitor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {currentUser?.role === "Security" ? (
                  <Shield className="h-3 w-3 mr-1" />
                ) : (
                  <Car className="h-3 w-3 mr-1" />
                )}
                {currentUser?.role}
              </Badge>
              <span className="text-sm text-gray-600 hidden sm:block">{currentUser?.name}</span>
              <Button variant="ghost" onClick={logout} className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6">
              <NavigationMenu
                currentPage="dashboard"
                currentUser={currentUser}
                onPageChange={handleNavigate}
                onLogout={logout}
              />
            </div>
          </aside>
          <main className="flex-1">
            <DashboardMain
              userRole={currentUser?.role || "User"}
              userVehiclesCount={userVehicles.length}
              activeSessionsCount={activityLogs.filter(log => log.logType === 'Entry').length}
              totalVehiclesCount={vehicles.length}
              recentActivities={recentActivities}
              onNavigate={handleNavigate}
            />
          </main>
        </div>
      </div>
      <ConnectivityIndicator isConnected={webSocketConnected} />
    </div>
  );
};