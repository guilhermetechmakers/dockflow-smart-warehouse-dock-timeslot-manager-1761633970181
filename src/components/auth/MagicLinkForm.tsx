import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { magicLinkSchema, type MagicLinkInput } from '@/lib/validations';
import { useSendMagicLink } from '@/hooks/useAuth';

interface MagicLinkFormProps {
  onSuccess?: () => void;
}

export function MagicLinkForm({ onSuccess }: MagicLinkFormProps) {
  const magicLinkMutation = useSendMagicLink();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
  });

  const onSubmit = async (data: MagicLinkInput) => {
    try {
      await magicLinkMutation.mutateAsync(data.email);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="magic-link-card">
      <div className="magic-link-icon">
        <Mail className="h-8 w-8 text-coral-500" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-dark">Magic Link Login</h3>
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a secure login link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="form-label">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            className="form-input"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending magic link...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send magic link
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-gray-500">
        The magic link will expire in 15 minutes for security.
      </p>
    </div>
  );
}