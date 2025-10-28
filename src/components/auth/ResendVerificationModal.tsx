import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';

interface ResendVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResendVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: ResendVerificationModalProps) {
  const [email, setEmail] = useState('');

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerificationEmail,
    onSuccess: () => {
      toast.success('Verification email sent successfully!');
      onSuccess?.();
      onClose();
      setEmail('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send verification email');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    resendMutation.mutate(email.trim());
  };

  const handleClose = () => {
    if (!resendMutation.isPending) {
      onClose();
      setEmail('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 bg-coral-100 rounded-2xl flex items-center justify-center">
            <Mail className="h-6 w-6 text-coral-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-dark">
            Resend Verification Email
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Enter your email address and we'll send you a new verification link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="form-label">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              disabled={resendMutation.isPending}
              required
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={resendMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={resendMutation.isPending || !email.trim()}
              className="btn-primary w-full sm:w-auto"
            >
              {resendMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Verification Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}