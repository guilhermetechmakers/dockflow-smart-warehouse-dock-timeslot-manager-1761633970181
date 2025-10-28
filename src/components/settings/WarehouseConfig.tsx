import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Clock, 
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const warehouseConfigSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  publicBookingLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  operatingHours: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    tuesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    wednesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    thursday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    friday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    saturday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    sunday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
  }),
});

type WarehouseConfigForm = z.infer<typeof warehouseConfigSchema>;

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC',
];

const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function WarehouseConfig() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WarehouseConfigForm>({
    resolver: zodResolver(warehouseConfigSchema),
    defaultValues: {
      name: 'Main Warehouse',
      address: '1234 Industrial Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'United States',
      timezone: 'America/Chicago',
      contactPhone: '+1 (555) 123-4567',
      contactEmail: 'warehouse@company.com',
      publicBookingLink: 'https://dockflow.app/book/warehouse-123',
      operatingHours: {
        monday: { isOpen: true, openTime: '06:00', closeTime: '18:00' },
        tuesday: { isOpen: true, openTime: '06:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '06:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '06:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '06:00', closeTime: '18:00' },
        saturday: { isOpen: false, openTime: '09:00', closeTime: '15:00' },
        sunday: { isOpen: false, openTime: '09:00', closeTime: '15:00' },
      },
    },
  });

  const operatingHours = watch('operatingHours');

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Warehouse configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save warehouse configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayToggle = (day: string, isOpen: boolean) => {
    setValue(`operatingHours.${day}.isOpen` as any, isOpen, { shouldDirty: true });
  };

  const handleTimeChange = (day: string, field: 'openTime' | 'closeTime', value: string) => {
    setValue(`operatingHours.${day}.${field}` as any, value, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <Card className="dockflow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-coral-500" />
            Warehouse Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="form-label">
                    Warehouse Name *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className="form-input"
                    placeholder="Enter warehouse name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address" className="form-label">
                    Address *
                  </Label>
                  <Input
                    id="address"
                    {...register('address')}
                    className="form-input"
                    placeholder="Enter street address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="form-label">
                      City *
                    </Label>
                    <Input
                      id="city"
                      {...register('city')}
                      className="form-input"
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state" className="form-label">
                      State *
                    </Label>
                    <Input
                      id="state"
                      {...register('state')}
                      className="form-input"
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode" className="form-label">
                      ZIP Code *
                    </Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode')}
                      className="form-input"
                      placeholder="ZIP Code"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country" className="form-label">
                      Country *
                    </Label>
                    <Input
                      id="country"
                      {...register('country')}
                      className="form-input"
                      placeholder="Country"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone" className="form-label">
                    Timezone *
                  </Label>
                  <Select
                    value={watch('timezone')}
                    onValueChange={(value) => setValue('timezone', value, { shouldDirty: true })}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timezone && (
                    <p className="text-red-500 text-sm mt-1">{errors.timezone.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contactPhone" className="form-label">
                    Contact Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    {...register('contactPhone')}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactPhone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactEmail" className="form-label">
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    className="form-input"
                    placeholder="warehouse@company.com"
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="publicBookingLink" className="form-label">
                    Public Booking Link
                  </Label>
                  <Input
                    id="publicBookingLink"
                    {...register('publicBookingLink')}
                    className="form-input"
                    placeholder="https://dockflow.app/book/warehouse-123"
                  />
                  {errors.publicBookingLink && (
                    <p className="text-red-500 text-sm mt-1">{errors.publicBookingLink.message}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    This link allows carriers to book slots without logging in
                  </p>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                <Clock className="h-5 w-5 text-coral-500" />
                Operating Hours
              </h3>
              <div className="space-y-3">
                {days.map((day) => {
                  const dayHours = operatingHours[day.key as keyof typeof operatingHours];
                  return (
                    <div key={day.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-24">
                        <Label className="text-sm font-medium text-dark">
                          {day.label}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={dayHours.isOpen}
                          onCheckedChange={(checked) => handleDayToggle(day.key, checked)}
                        />
                        <span className="text-sm text-gray-600">
                          {dayHours.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      {dayHours.isOpen && (
                        <div className="flex items-center gap-2">
                          <div>
                            <Label className="text-xs text-gray-500">Open</Label>
                            <Input
                              type="time"
                              value={dayHours.openTime || ''}
                              onChange={(e) => handleTimeChange(day.key, 'openTime', e.target.value)}
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                          <span className="text-gray-400">-</span>
                          <div>
                            <Label className="text-xs text-gray-500">Close</Label>
                            <Input
                              type="time"
                              value={dayHours.closeTime || ''}
                              onChange={(e) => handleTimeChange(day.key, 'closeTime', e.target.value)}
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}