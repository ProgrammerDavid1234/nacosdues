import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, KeyRound, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/components/api/api';

interface ProfileFormData {
  full_name: string;
  email: string;
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

const EditProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: user?.fullName || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Full name is required",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Email is required",
      });
      return;
    }

    // Password validation
    if (formData.new_password || formData.confirm_new_password || formData.current_password) {
      if (!formData.current_password) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Current password is required to change password",
        });
        return;
      }

      if (!formData.new_password) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "New password is required",
        });
        return;
      }

      if (formData.new_password.length < 6) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "New password must be at least 6 characters long",
        });
        return;
      }

      if (formData.new_password !== formData.confirm_new_password) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "New passwords do not match",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const endpoint = user?.role === 'admin' 
        ? '/users/profile/admin' 
        : '/users/profile/student';

      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
      };

      // Only include password fields if user is changing password
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }
      
      const response = await axios.put(
        `${API_BASE_URL}${endpoint}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update user context with new data
      // Make sure the data structure matches what AuthContext expects
      if (response.data && response.data.user) {
        updateUser(response.data.user);
      }

      // Show success toast
      toast({
        title: "Success!",
        description: "Profile updated successfully",
        className: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_new_password: '',
      }));

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error('Profile update error:', err);
      
      const errorMessage = err.response?.data?.detail 
        || err.message 
        || 'Failed to update profile. Please try again.';
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container max-w-2xl"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Profile</CardTitle>
            <CardDescription>
              Update your personal information and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Editable Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Disabled Fields */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Read-only Information
                </h3>
                
                {user?.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="matric_number" className="text-muted-foreground">
                        Matric Number
                      </Label>
                      <Input
                        id="matric_number"
                        value={user?.matricNumber || 'Not set'}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level" className="text-muted-foreground">
                        Level
                      </Label>
                      <Input
                        id="level"
                        value={user?.level || 'Not set'}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-muted-foreground">
                        Department
                      </Label>
                      <Input
                        id="department"
                        value={(user as any)?.department || 'Not set'}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-muted-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={(user as any)?.phone || 'Not set'}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-muted-foreground">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={user?.role || ''}
                    disabled
                    className="bg-muted cursor-not-allowed capitalize"
                  />
                </div>
              </div>

              {/* Password Change Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Change Password (Optional)
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      name="current_password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={formData.current_password}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      className="pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      name="new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.new_password}
                      onChange={handleChange}
                      placeholder="Enter new password (min 6 characters)"
                      className="pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_new_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_new_password"
                      name="confirm_new_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirm_new_password}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditProfile;