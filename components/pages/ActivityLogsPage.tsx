"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Activity, Shield } from "lucide-react";
import { useAppContext } from '@/context/AppContext';
import { ActivityLogs } from '../dashboard/ActivityLogs';
import { NavigationMenu } from '../dashboard/NavigationMenu';

export const ActivityLogsPage = () => {
  const router = useRouter();
  const { currentUser, activityLogs, loading, fetchActivities, logout } = useAppContext();

  useEffect(() => {
    fetchActivities();
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Expired</h2>
          <Button onClick={logout}>Return to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {currentUser.role === "Security" ? (
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
              ) : (
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
              )}
              <h1 className="text-xl font-semibold">
                {currentUser.role === "Security" ? "Activity Monitor" : "Activity Logs"}
              </h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
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
                currentPage="activity-logs"
                currentUser={currentUser}
                onPageChange={(page) => router.push(`/${page}`)}
                onLogout={logout}
              />
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading activities...</p>
              </div>
            ) : (
              <ActivityLogs
                logs={activityLogs}
                userRole={currentUser.role}
                onNavigateToVehicle={(plate) => {
                  router.push('/registered-vehicles');
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};