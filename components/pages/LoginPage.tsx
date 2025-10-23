"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { LoginForm } from '../auth/LoginForm';

export const LoginPage = () => {
  const router = useRouter();
  const { login, loading } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const loginError = await login({ email, password });
    if (loginError) {
      setError(loginError);
    }
  };

  const handleNavigateToRegister = () => {
    router.push('/register');
  };

  const handleNavigateToHome = () => {
    router.push('/');
  };

  return (
    <LoginForm
      email={email}
      password={password}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onNavigateToRegister={handleNavigateToRegister}
      onNavigateToHome={handleNavigateToHome}
    />
  );
};