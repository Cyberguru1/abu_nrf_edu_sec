"use client"

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { RegisterForm } from '../auth/RegisterForm';

export const RegisterPage = () => {
    const { setCurrentPage, setNotification } = useAppContext();

    return (
        <RegisterForm
            onSuccess={() => {
                setNotification("Registration successful! Please login.", "success");
                setCurrentPage("login");
            }}
            onNavigateToLogin={() => setCurrentPage("login")}
            onNavigateToHome={() => setCurrentPage("landing")}
        />
    );
};