"use client"

import React from 'react';

interface ConnectivityIndicatorProps {
  isConnected: boolean;
}

export const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({ isConnected }) => {
  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white p-2 rounded-lg shadow-md">
      <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="text-sm text-gray-700">{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
};
