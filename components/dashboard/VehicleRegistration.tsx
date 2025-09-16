import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { verifyVehiclePlate } from "@/services/verifyPlateNumber";
import { Car } from "lucide-react";
import { useState } from "react";

interface VehicleRegistrationProps {
  formData: {
    plateNumber: string;
    model: string;
    color: string;
    type: string;
  };
  onPlateNumberChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const VehicleRegistration = ({
  formData,
  onPlateNumberChange,
  onModelChange,
  onColorChange,
  onTypeChange,
  onSubmit,
  onCancel,
}: VehicleRegistrationProps) => {
  const vehicleTypes = [
    { value: 'bus', label: 'Bus' },
    { value: 'car', label: 'Car' },
    { value: 'bike', label: 'Bike' }
  ];

  const [plateError, setPlateError] = useState("");
  const plateNumberRegex = /^([A-Z0-9]+-[A-Z0-9]+)$/i;

  const handlePlateNumberBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const plate = formData.plateNumber;


    if (!plate) {
      setPlateError("Plate number is required.");
      formData.color = "";
      formData.model = "";
      return;
    }

    // Validate format
    if (!plateNumberRegex.test(plate)) {
      setPlateError("Invalid plate number format. Use xxx-xxxxx.");
      return;
    }

    setPlateError("");

    const normalizedPlate = plate.replace(/-/g, '').toLowerCase();
    if (plate) {
      try {
        const resp = await verifyVehiclePlate(normalizedPlate);
        console.log(resp);
        // Update form data with the response
        if (resp.data?.vehicleMake) {
          formData.model = resp.data.vehicleMake;
        }
        if (resp.data?.vehicleColor) {
          formData.color = resp.data.vehicleColor;
        }

        if (resp.error) {
          setPlateError("Invalid plate number");
        }
        // Set vehicle type to car
        onTypeChange('car');
      } catch (error) {
        console.error("Error verifying plate number:", error);
      }
    } else {
      formData.color = '';
      formData.model = '';
      formData.color = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Car className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle>Register Vehicle</CardTitle>
                <CardDescription>Add a new vehicle to your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Plate Number */}
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">License Plate Number</Label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      onPlateNumberChange(value);
                    }}
                    onBlur={handlePlateNumberBlur}
                    placeholder="e.g., ABC-123"
                    required
                    maxLength={15}
                  />
                  {plateError && (
                    <p className="text-red-500 text-sm mt-1">{plateError}</p>
                  )}
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => onModelChange(e.target.value)}
                    placeholder="e.g., Toyota Camry"
                    required
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => onColorChange(e.target.value)}
                    placeholder="e.g., White"
                    required
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={onTypeChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Register Vehicle
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};