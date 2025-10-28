import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Save, X, AlertTriangle, Calendar, MapPin, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { publicBookingApi } from '@/lib/api';
import { bookingModifySchema, type BookingModifyInput } from '@/lib/validations';

interface BookingDetails {
  id: string;
  booking_token: string;
  modify_token: string;
  cancel_token: string;
  reference_number: string;
  warehouse: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  dock: {
    id: string;
    name: string;
    number: string;
  };
  carrier_name: string;
  trailer_plate: string;
  driver_name?: string;
  driver_phone?: string;
  driver_email?: string;
  eta: string;
  pallets: number;
  adr_declarations: string[];
  temperature_controlled: boolean;
  special_equipment: string[];
  hazmat: boolean;
  tailgate_required: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export function BookingModifyPage() {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  const form = useForm<BookingModifyInput>({
    resolver: zodResolver(bookingModifySchema),
    defaultValues: {
      carrier_name: '',
      trailer_plate: '',
      driver_name: '',
      driver_phone: '',
      driver_email: '',
      eta: '',
      pallets: 1,
      adr_declarations: [],
      temperature_controlled: false,
      special_equipment: [],
      hazmat: false,
      tailgate_required: false,
    },
  });

  // Load booking details on mount
  useEffect(() => {
    if (token) {
      loadBookingDetails();
    } else {
      setError('No booking token provided');
    }
  }, [token]);

  const loadBookingDetails = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await publicBookingApi.getBookingByToken(token);
      setBooking(data);
      
      // Populate form with existing data
      form.reset({
        carrier_name: data.carrier_name,
        trailer_plate: data.trailer_plate,
        driver_name: data.driver_name || '',
        driver_phone: data.driver_phone || '',
        driver_email: data.driver_email || '',
        eta: data.eta,
        pallets: data.pallets,
        adr_declarations: data.adr_declarations || [],
        temperature_controlled: data.temperature_controlled || false,
        special_equipment: data.special_equipment || [],
        hazmat: data.hazmat || false,
        tailgate_required: data.tailgate_required || false,
      });
    } catch (error) {
      setError('Failed to load booking details');
      console.error('Error loading booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BookingModifyInput) => {
    if (!token) return;
    
    try {
      setSaving(true);
      await publicBookingApi.modifyBooking(token, data);
      toast.success('Booking updated successfully!');
      
      // Reload booking details to get updated information
      await loadBookingDetails();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update booking');
      console.error('Error updating booking:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!token || !booking) return;
    
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    
    try {
      setSaving(true);
      await publicBookingApi.cancelBooking(token);
      toast.success('Booking cancelled successfully!');
      
      // Redirect to a cancellation confirmation page or back to booking page
      window.location.href = '/book';
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Error cancelling booking:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="dockflow-card">
            <CardContent className="pt-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error || 'Booking not found'}
                </AlertDescription>
              </Alert>
              <div className="mt-6 text-center">
                <Button onClick={() => window.location.href = '/book'}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-100 rounded-full">
            <Calendar className="w-8 h-8 text-coral-500" />
          </div>
          <h1 className="text-3xl font-bold text-dark">Modify Booking</h1>
          <p className="text-gray-600">
            Update your dock booking details. Reference: <span className="font-mono font-semibold text-coral-500">{booking.reference_number}</span>
          </p>
        </div>

        {/* Current Booking Info */}
        <Card className="dockflow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Current Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Warehouse</Label>
                  <p className="text-lg font-semibold text-dark">{booking.warehouse.name}</p>
                  <p className="text-sm text-gray-600">{booking.warehouse.address}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dock</Label>
                  <p className="text-lg font-semibold text-dark">Dock {booking.dock.number}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <p className="text-lg font-semibold text-dark capitalize">{booking.status}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-lg font-semibold text-dark">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Booking Details Form */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Carrier Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-dark">Carrier Information</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="carrier_name">Carrier Name *</Label>
                    <Input
                      {...form.register('carrier_name')}
                      placeholder="Enter carrier name"
                      className="form-input"
                    />
                    {form.formState.errors.carrier_name && (
                      <p className="text-sm text-red-500">{form.formState.errors.carrier_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trailer_plate">Trailer Plate Number *</Label>
                    <Input
                      {...form.register('trailer_plate')}
                      placeholder="Enter trailer plate"
                      className="form-input"
                    />
                    {form.formState.errors.trailer_plate && (
                      <p className="text-sm text-red-500">{form.formState.errors.trailer_plate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver_name">Driver Name (Optional)</Label>
                    <Input
                      {...form.register('driver_name')}
                      placeholder="Enter driver name"
                      className="form-input"
                    />
                    {form.formState.errors.driver_name && (
                      <p className="text-sm text-red-500">{form.formState.errors.driver_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver_phone">Driver Phone (Optional)</Label>
                    <Input
                      {...form.register('driver_phone')}
                      placeholder="Enter phone number"
                      className="form-input"
                    />
                    {form.formState.errors.driver_phone && (
                      <p className="text-sm text-red-500">{form.formState.errors.driver_phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver_email">Driver Email (Optional)</Label>
                    <Input
                      {...form.register('driver_email')}
                      type="email"
                      placeholder="Enter email address"
                      className="form-input"
                    />
                    {form.formState.errors.driver_email && (
                      <p className="text-sm text-red-500">{form.formState.errors.driver_email.message}</p>
                    )}
                  </div>
                </div>

                {/* Cargo Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-dark">Cargo Information</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pallets">Number of Pallets *</Label>
                    <Input
                      {...form.register('pallets', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="1000"
                      className="form-input"
                    />
                    {form.formState.errors.pallets && (
                      <p className="text-sm text-red-500">{form.formState.errors.pallets.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">Cargo Declarations</Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hazmat"
                          checked={form.watch('hazmat')}
                          onCheckedChange={(checked) => form.setValue('hazmat', checked as boolean)}
                        />
                        <Label htmlFor="hazmat" className="text-sm">
                          Hazardous Materials (ADR)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="temperature_controlled"
                          checked={form.watch('temperature_controlled')}
                          onCheckedChange={(checked) => form.setValue('temperature_controlled', checked as boolean)}
                        />
                        <Label htmlFor="temperature_controlled" className="text-sm">
                          Temperature Controlled
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tailgate_required"
                          checked={form.watch('tailgate_required')}
                          onCheckedChange={(checked) => form.setValue('tailgate_required', checked as boolean)}
                        />
                        <Label htmlFor="tailgate_required" className="text-sm">
                          Tailgate Required
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special_equipment">Special Equipment (Optional)</Label>
                    <Textarea
                      {...form.register('special_equipment')}
                      placeholder="List any special equipment needed"
                      className="form-input"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary"
                >
                  {saving ? (
                    <>
                      <div className="spinner mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Booking
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={saving}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
