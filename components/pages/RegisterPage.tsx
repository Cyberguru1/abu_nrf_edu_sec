"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '../auth/RegisterForm';

export const RegisterPage = () => {
  const router = useRouter();

  const handleNavigateToLogin = () => {
    router.push('/login');
  };

  const handleNavigateToHome = () => {
    router.push('/');
  };

  return (
    <RegisterForm
      onNavigateToLogin={handleNavigateToLogin}
      onNavigateToHome={handleNavigateToHome}
    />
  );
};