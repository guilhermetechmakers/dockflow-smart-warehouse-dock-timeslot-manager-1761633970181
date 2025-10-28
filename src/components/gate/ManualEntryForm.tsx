import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, AlertCircle, CheckCircle2, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualEntryForm as ManualEntryFormType, PlateLookupResult } from '@/types/gate';

const manualEntrySchema = z.object({
  plate_number: z.string().min(1, 'Plate number is required').max(20, 'Plate number too long'),
  carrier_name: z.string().optional(),
  booking_reference: z.string().optional(),
});

interface ManualEntryFormProps {
  onLookup: (data: ManualEntryFormType) => Promise<PlateLookupResult>;
  onSuccess: (result: PlateLookupResult) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function ManualEntryForm({ onLookup, onSuccess, onError, className }: ManualEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<PlateLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ManualEntryFormType>({
    resolver: zodResolver(manualEntrySchema),
  });

  const plateNumber = watch('plate_number');

  const onSubmit = async (data: ManualEntryFormType) => {
    try {
      setIsLoading(true);
      setError(null);
      setLookupResult(null);

      const result = await onLookup(data);
      setLookupResult(result);

      if (result.valid && result.booking_id) {
        onSuccess(result);
      } else {
        setError('No booking found for this plate number');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to lookup booking';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    reset();
    setLookupResult(null);
    setError(null);
  };

  const handleSelectMatch = (match: any) => {
    const result: PlateLookupResult = {
      booking_id: match.booking_id,
      booking_token: match.booking_token,
      visit_id: match.visit_id,
      valid: true,
      matches: [match],
    };
    onSuccess(result);
  };

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Manual Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Plate Number */}
          <div className="space-y-2">
            <Label htmlFor="plate_number" className="form-label">
              License Plate Number *
            </Label>
            <Input
              id="plate_number"
              {...register('plate_number')}
              placeholder="Enter license plate number"
              className={cn(
                'form-input text-lg font-mono tracking-wider',
                errors.plate_number && 'border-red-500 focus:ring-red-500'
              )}
              autoComplete="off"
              autoCapitalize="characters"
            />
            {errors.plate_number && (
              <p className="text-sm text-red-600">{errors.plate_number.message}</p>
            )}
          </div>

          {/* Carrier Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="carrier_name" className="form-label">
              Carrier Name (Optional)
            </Label>
            <Input
              id="carrier_name"
              {...register('carrier_name')}
              placeholder="Enter carrier name"
              className="form-input"
            />
          </div>

          {/* Booking Reference (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="booking_reference" className="form-label">
              Booking Reference (Optional)
            </Label>
            <Input
              id="booking_reference"
              {...register('booking_reference')}
              placeholder="Enter booking reference"
              className="form-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading || !plateNumber}
              className="flex-1 btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup Booking
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={handleClear}
              variant="outline"
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Lookup Results */}
        {lookupResult && (
          <div className="space-y-4">
            {lookupResult.valid ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Booking found successfully!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  No exact match found, but here are some similar bookings:
                </AlertDescription>
              </Alert>
            )}

            {/* Multiple Matches */}
            {lookupResult.matches && lookupResult.matches.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Matching Bookings:</h4>
                {lookupResult.matches.map((match, index) => (
                  <Card
                    key={index}
                    className="p-4 border border-gray-200 hover:border-coral-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleSelectMatch(match)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {match.carrier_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {match.confidence ? `${Math.round(match.confidence * 100)}% match` : 'Match'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Plate: <span className="font-mono font-medium">{match.trailer_plate}</span></p>
                        <p>ETA: {new Date(match.eta).toLocaleString()}</p>
                        <p>Status: <span className="capitalize">{match.status.replace('_', ' ')}</span></p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Single Match - Auto Select */}
            {lookupResult.valid && lookupResult.booking_id && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Booking Found</span>
                </div>
                <p className="text-sm text-green-700">
                  This booking will be automatically selected for check-in.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Enter the license plate number exactly as it appears on the vehicle</p>
          <p>• Include carrier name for better matching accuracy</p>
          <p>• Use booking reference if you have it available</p>
        </div>
      </CardContent>
    </Card>
  );
}