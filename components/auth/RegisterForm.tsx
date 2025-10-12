import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { useAppContext } from '@/context/AppContext';
import { RegisterData } from '@/types/auth';

interface RegisterFormProps {
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export const RegisterForm = ({
  onNavigateToLogin,
  onNavigateToHome,
}: RegisterFormProps) => {
  const { register, loading, notification } = useAppContext();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Create Account
          </CardTitle>
          <CardDescription>Register for vehicle monitoring system</CardDescription>
        </CardHeader>
        <CardContent>
          {notification.show && notification.type === 'error' && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {notification.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password" // Important for registration forms
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onNavigateToHome}
              disabled={loading}
            >
              Back to Home
            </Button>
            <div className="text-center text-sm mt-4">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="text-blue-600 hover:text-blue-800 p-0 h-auto" 
                onClick={onNavigateToLogin}
                disabled={loading}
              >
                Login
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Password must contain:
              <ul className="list-disc pl-5">
                <li>At least 8 characters</li>
                <li>1 uppercase letter</li>
                <li>1 lowercase letter</li>
                <li>1 number</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};