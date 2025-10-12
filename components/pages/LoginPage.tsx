"use client"

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { LoginForm } from '../auth/LoginForm';

export const LoginPage = () => {
  const { login, loading, setCurrentPage } = useAppContext();
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

  return (
    <LoginForm
      email={email}
      password={password}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onNavigateToRegister={() => setCurrentPage('register')}
      onNavigateToHome={() => setCurrentPage('landing')}
    />
  );
};