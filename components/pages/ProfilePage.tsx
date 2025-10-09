"use client"

import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";
import { useAppContext } from '@/context/AppContext';
import { ProfileContainer } from '../dashboard/ProfileContainer';

export const ProfilePage = () => {
  const { currentUser, profileForm, fetchProfile, updateProfile, profileLoading, setCurrentPage } = useAppContext();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!currentUser) return null;

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
              <h1 className="text-xl font-semibold">My Profile</h1>
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

      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ProfileContainer
          currentUser={currentUser}
          initialData={{
            full_name: profileForm.name,
            phone: profileForm.phone
          }}
          onSave={updateProfile}
          loading={profileLoading}
        />
      </main>
    </div>
  );
};