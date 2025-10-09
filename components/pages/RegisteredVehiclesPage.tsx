"use client"

import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";
import { useAppContext } from '@/context/AppContext';
import { RegisteredVehicles } from '../dashboard/RegisteredVehicles';
import { NavigationMenu } from '../dashboard/NavigationMenu';

export const RegisteredVehiclesPage = () => {
  const { currentUser, vehicles, loading, fetchVehicles, deleteVehicle, setCurrentPage, logout } = useAppContext();

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (!currentUser) return null;

  const userVehicles = vehicles.filter(v => v.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {currentUser.role === "Security" ? (
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
              ) : (
                <User className="h-8 w-8 text-blue-600 mr-3" />
              )}
              <h1 className="text-xl font-semibold">My Vehicles</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage("dashboard")}
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
                currentPage="registered-vehicles"
                currentUser={currentUser}
                onPageChange={setCurrentPage}
                onLogout={logout}
              />
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading vehicles...</p>
              </div>
            ) : (
              <RegisteredVehicles
                vehicles={userVehicles}
                onEdit={(vehicleId) => {
                  // This part needs to be thought out.
                  // Maybe set an editingVehicleId in context and navigate.
                  setCurrentPage("vehicle-registration");
                }}
                onDelete={deleteVehicle}
                onRegisterNew={() => setCurrentPage("vehicle-registration")}
                loading={loading}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};