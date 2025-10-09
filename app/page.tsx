"use client"

import React from 'react';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { LandingPage } from '@/components/pages/LandingPage';
import { LoginPage } from '@/components/pages/LoginPage';
import { RegisterPage } from '@/components/pages/RegisterPage';
import { DashboardPage } from '@/components/pages/DashboardPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { VehicleRegistrationPage } from '@/components/pages/VehicleRegistrationPage';
import { RegisteredVehiclesPage } from '@/components/pages/RegisteredVehiclesPage';
import { ActivityLogsPage } from '@/components/pages/ActivityLogsPage';
import { Notification } from '@/components/ui/Notification';

const PageRouter = () => {
  const { currentPage, currentUser, notification, setNotification } = useAppContext();

  const renderPage = () => {
    if (!currentUser) {
      switch (currentPage) {
        case 'login':
          return <LoginPage />;
        case 'register':
          return <RegisterPage />;
        default:
          return <LandingPage />;
      }
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'profile':
        return <ProfilePage />;
      case 'vehicle-registration':
        return <VehicleRegistrationPage />;
      case 'registered-vehicles':
        return <RegisteredVehiclesPage />;
      case 'activity-logs':
        return <ActivityLogsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      {renderPage()}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={() => setNotification('')}
        />
      )}
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <PageRouter />
    </AppProvider>
  );
};

export default App;