"use client"

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { VehicleRegistration } from '../dashboard/VehicleRegistration';

export const VehicleRegistrationPage = () => {
  const { addVehicle, setCurrentPage } = useAppContext();
  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    color: '',
    type: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle({
        plate_number: formData.plateNumber,
        model: formData.model,
        color: formData.color,
        type: formData.type.toLowerCase() as 'bus' | 'car' | 'bike'
    });
  };

  return (
    <VehicleRegistration
      formData={formData}
      onPlateNumberChange={(plateNumber) => setFormData({ ...formData, plateNumber })}
      onModelChange={(model) => setFormData({ ...formData, model })}
      onColorChange={(color) => setFormData({ ...formData, color })}
      onTypeChange={(type) => setFormData({ ...formData, type })}
      onSubmit={handleSubmit}
      onCancel={() => setCurrentPage('dashboard')}
    />
  );
};