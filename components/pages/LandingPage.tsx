import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAppContext } from '@/context/AppContext';

export const LandingPage = () => {
  const { setCurrentPage } = useAppContext();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-6 bg-transparent">
        <div className="text-2xl font-bold">VehicleMonitor</div>
        <div>
          <Button variant="ghost" onClick={() => setCurrentPage('login')}>Login</Button>
          <Button onClick={() => setCurrentPage('register')}>Sign Up</Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-5xl font-bold mb-4">Welcome to VehicleMonitor</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your one-stop solution for vehicle security and monitoring.
        </p>
        <Button size="lg" onClick={() => setCurrentPage('register')}>
          Get Started <ArrowRight className="ml-2" />
        </Button>
      </main>
    </div>
  );
};