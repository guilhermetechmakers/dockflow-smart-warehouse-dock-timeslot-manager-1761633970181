import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { useChangePassword } from '@/hooks/useProfile';
import { passwordChangeSchema, type PasswordChangeInput } from '@/lib/validations';

export function PasswordChangeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (data: PasswordChangeInput) => {
    try {
      await changePassword.mutateAsync({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setIsOpen(false);
      reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    reset();
    setIsOpen(false);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Card className="dockflow-card dockflow-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-coral-500" />
            <CardTitle>Password Security</CardTitle>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-outline">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="form-label">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPasswords.current ? 'text' : 'password'}
                      {...register('current_password')}
                      className="form-input pr-10"
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.current_password && (
                    <p className="text-sm text-red-600">{errors.current_password.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new_password" className="form-label">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPasswords.new ? 'text' : 'password'}
                      {...register('new_password')}
                      className="form-input pr-10"
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.new_password && (
                    <p className="text-sm text-red-600">{errors.new_password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="form-label">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      {...register('confirm_password')}
                      className="form-input pr-10"
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-red-600">{errors.confirm_password.message}</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
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
                    {isSubmitting ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600">
          <p>Keep your account secure by using a strong password that you don't use elsewhere.</p>
          <p className="mt-2">Your password should be at least 8 characters long and include a mix of letters, numbers, and symbols.</p>
        </div>
      </CardContent>
    </Card>
  );
}
