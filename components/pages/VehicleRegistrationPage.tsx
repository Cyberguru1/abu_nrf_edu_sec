"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { VehicleRegistration } from '../dashboard/VehicleRegistration';

export const VehicleRegistrationPage = () => {
  const router = useRouter();
  const { addVehicle } = useAppContext();
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
      onCancel={() => router.push('/dashboard')}
    />
  );
};