"use client";

import { useAppContext } from "@/context/AppContext";
import { LandingPage as LandingPageComponent } from "@/components/landing/LandingPage";

export const LandingPage = () => {
  const { setCurrentPage, currentUser } = useAppContext();

  const handleRegisterClick = () => {
    if (currentUser) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  };

  return (
    <LandingPageComponent
      onNavigateToRegister={handleRegisterClick}
      onNavigateToLogin={() => setCurrentPage('login')}
    />
  );
};