import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useUpdateProfile } from '@/hooks/useProfile';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations';

interface ProfileDetailsFormProps {
  user: any;
}

export function ProfileDetailsForm({ user }: ProfileDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    try {
      await updateProfile.mutateAsync(data);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <Card className="dockflow-card dockflow-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-coral-500" />
            <CardTitle>Profile Details</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={user?.is_verified ? "default" : "secondary"} className="status-success">
              {user?.is_verified ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unverified
                </>
              )}
            </Badge>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="btn-outline"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="form-label">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="form-input bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="form-label">
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </Label>
              <Input
                id="full_name"
                {...register('full_name')}
                disabled={!isEditing}
                className="form-input"
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="form-label">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                disabled={!isEditing}
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Role (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="role" className="form-label">
                <Shield className="h-4 w-4 inline mr-2" />
                Role
              </Label>
              <Input
                id="role"
                value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                disabled
                className="form-input bg-gray-50"
              />
              <p className="text-xs text-gray-500">Role is managed by administrators</p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="btn-outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
