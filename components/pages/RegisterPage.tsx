"use client"

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { RegisterForm } from '../auth/RegisterForm';

export const RegisterPage = () => {
    const { setCurrentPage } = useAppContext();

    return (
        <RegisterForm
            onNavigateToLogin={() => setCurrentPage("login")}
            onNavigateToHome={() => setCurrentPage("landing")}
        />
    );
};