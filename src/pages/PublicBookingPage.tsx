import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MapPin, Truck, User, Mail, CheckCircle, QrCode, Download, Share2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { publicBookingApi } from '@/lib/api';
import { publicBookingSchema, type PublicBookingInput } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  contact_phone?: string;
  contact_email?: string;
}

interface Dock {
  id: string;
  name: string;
  number: string;
  capabilities: string[];
  is_active: boolean;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  available: boolean;
  capacity: number;
  booked: number;
}

interface BookingConfirmation {
  id: string;
  booking_token: string;
  modify_token: string;
  cancel_token: string;
  qr_code: string;
  reference_number: string;
  warehouse: Warehouse;
  dock: Dock;
  slot: TimeSlot;
  carrier_name: string;
  trailer_plate: string;
  eta: string;
  pallets: number;
  status: string;
}

export function PublicBookingPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'selection' | 'form' | 'confirmation'>('selection');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [docks, setDocks] = useState<Dock[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [, setSelectedDock] = useState<Dock | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const form = useForm<PublicBookingInput>({
    resolver: zodResolver(publicBookingSchema),
    defaultValues: {
      warehouse_id: searchParams.get('warehouse_id') || '',
      dock_id: '',
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
      terms_accepted: false,
      privacy_accepted: false,
    },
  });

  // Load warehouses on mount
  useEffect(() => {
    loadWarehouses();
  }, []);

  // Load docks when warehouse changes
  useEffect(() => {
    if (form.watch('warehouse_id')) {
      loadDocks(form.watch('warehouse_id'));
    }
  }, [form.watch('warehouse_id')]);

  // Load time slots when dock and date change
  useEffect(() => {
    if (form.watch('dock_id') && selectedDate) {
      loadTimeSlots(form.watch('warehouse_id'), form.watch('dock_id'), selectedDate);
    }
  }, [form.watch('dock_id'), selectedDate]);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await publicBookingApi.getWarehouses();
      setWarehouses(data);
      
      // If warehouse_id is in URL, pre-select it
      const warehouseId = searchParams.get('warehouse_id');
      if (warehouseId) {
        const warehouse = data.find((w: Warehouse) => w.id === warehouseId);
        if (warehouse) {
          setSelectedWarehouse(warehouse);
        }
      }
    } catch (error) {
      toast.error('Failed to load warehouses');
      console.error('Error loading warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocks = async (warehouseId: string) => {
    try {
      setLoading(true);
      const data = await publicBookingApi.getDocks(warehouseId);
      setDocks(data.filter((dock: Dock) => dock.is_active));
      
      // Reset selections
      setSelectedDock(null);
      setSelectedSlot(null);
      setTimeSlots([]);
      form.setValue('dock_id', '');
    } catch (error) {
      toast.error('Failed to load docks');
      console.error('Error loading docks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (warehouseId: string, dockId: string, date: string) => {
    try {
      setLoading(true);
      const data = await publicBookingApi.getAvailableSlots(warehouseId, dockId, date);
      setTimeSlots(data);
      
      // Reset slot selection
      setSelectedSlot(null);
      form.setValue('eta', '');
    } catch (error) {
      toast.error('Failed to load available time slots');
      console.error('Error loading time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    setSelectedWarehouse(warehouse || null);
    form.setValue('warehouse_id', warehouseId);
  };

  const handleDockChange = (dockId: string) => {
    const dock = docks.find(d => d.id === dockId);
    setSelectedDock(dock || null);
    form.setValue('dock_id', dockId);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    form.setValue('eta', slot.start_time);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const onSubmit = async (data: PublicBookingInput) => {
    try {
      setLoading(true);
      const result = await publicBookingApi.createBooking(data);
      setConfirmation(result);
      setStep('confirmation');
      toast.success('Booking created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConfirmation = async (methods: { email?: string; sms?: string }) => {
    if (!confirmation) return;
    
    try {
      setLoading(true);
      await publicBookingApi.sendConfirmation(confirmation.id, methods);
      toast.success('Confirmation sent successfully!');
    } catch (error) {
      toast.error('Failed to send confirmation');
      console.error('Error sending confirmation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleShareBooking = async () => {
    if (!confirmation) return;
    
    const shareData = {
      title: 'DockFlow Booking Confirmation',
      text: `Booking ${confirmation.reference_number} for ${confirmation.warehouse.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Booking link copied to clipboard');
    }
  };

  if (step === 'confirmation' && confirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-coral-500" />
            </div>
            <h1 className="text-3xl font-bold text-dark">Booking Confirmed!</h1>
            <p className="text-gray-600">
              Your dock booking has been successfully created. Reference: <span className="font-mono font-semibold text-coral-500">{confirmation.reference_number}</span>
            </p>
          </div>

          {/* Confirmation Card */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img 
                    src={confirmation.qr_code} 
                    alt="Booking QR Code" 
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Present this QR code at the gate</p>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Warehouse</Label>
                    <p className="text-lg font-semibold text-dark">{confirmation.warehouse.name}</p>
                    <p className="text-sm text-gray-600">{confirmation.warehouse.address}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Dock</Label>
                    <p className="text-lg font-semibold text-dark">Dock {confirmation.dock.number}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Scheduled Time</Label>
                    <p className="text-lg font-semibold text-dark">
                      {new Date(confirmation.eta).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Carrier</Label>
                    <p className="text-lg font-semibold text-dark">{confirmation.carrier_name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Trailer Plate</Label>
                    <p className="text-lg font-semibold text-dark">{confirmation.trailer_plate}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Pallets</Label>
                    <p className="text-lg font-semibold text-dark">{confirmation.pallets}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button 
                  onClick={handlePrintTicket}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print Ticket
                </Button>
                <Button 
                  onClick={handleShareBooking}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Booking
                </Button>
                <Button 
                  onClick={() => handleSendConfirmation({ 
                    email: form.getValues('driver_email'),
                    sms: form.getValues('driver_phone')
                  })}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Confirmation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="dockflow-card">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-dark mb-4">Next Steps</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-coral-100 text-coral-500 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                  <p>Save this QR code or print the ticket for easy access at the gate</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-coral-100 text-coral-500 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                  <p>Arrive at the scheduled time and present your QR code to the gate operator</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-coral-100 text-coral-500 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                  <p>Follow the operator's instructions to proceed to your assigned dock</p>
                </div>
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
            <Truck className="w-8 h-8 text-coral-500" />
          </div>
          <h1 className="text-3xl font-bold text-dark">Book a Dock Slot</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Schedule your warehouse dock visit quickly and easily. No login required - just fill out the form below.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Warehouse & Dock Selection */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Step 1: Select Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warehouse Selection */}
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <Select 
                  value={form.watch('warehouse_id')} 
                  onValueChange={handleWarehouseChange}
                  disabled={loading}
                >
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{warehouse.name}</span>
                          <span className="text-sm text-gray-500">
                            {warehouse.city}, {warehouse.state}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.warehouse_id && (
                  <p className="text-sm text-red-500">{form.formState.errors.warehouse_id.message}</p>
                )}
              </div>

              {/* Dock Selection */}
              {form.watch('warehouse_id') && (
                <div className="space-y-2">
                  <Label htmlFor="dock">Dock *</Label>
                  <Select 
                    value={form.watch('dock_id')} 
                    onValueChange={handleDockChange}
                    disabled={loading || !docks.length}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select a dock" />
                    </SelectTrigger>
                    <SelectContent>
                      {docks.map((dock) => (
                        <SelectItem key={dock.id} value={dock.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">Dock {dock.number}</span>
                            <span className="text-sm text-gray-500">{dock.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.dock_id && (
                    <p className="text-sm text-red-500">{form.formState.errors.dock_id.message}</p>
                  )}
                </div>
              )}

              {/* Date Selection */}
              {form.watch('dock_id') && (
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Time Slot Selection */}
              {selectedDate && timeSlots.length > 0 && (
                <div className="space-y-2">
                  <Label>Available Time Slots *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all duration-200",
                          selectedSlot?.id === slot.id
                            ? "border-coral-500 bg-coral-50"
                            : slot.available
                            ? "border-gray-200 bg-white hover:border-coral-300 hover:bg-coral-50"
                            : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-dark">
                              {new Date(slot.start_time).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(slot.end_time).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-coral-500">
                              {slot.capacity - slot.booked} available
                            </p>
                            <p className="text-xs text-gray-500">
                              of {slot.capacity}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.eta && (
                    <p className="text-sm text-red-500">{form.formState.errors.eta.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Booking Details */}
          {selectedSlot && (
            <Card className="dockflow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Step 2: Booking Details
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

                {/* Terms and Conditions */}
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-dark">Terms and Conditions</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms_accepted"
                        checked={form.watch('terms_accepted')}
                        onCheckedChange={(checked) => form.setValue('terms_accepted', checked as boolean)}
                      />
                      <Label htmlFor="terms_accepted" className="text-sm">
                        I accept the{' '}
                        <a href="/terms" className="text-coral-500 hover:text-coral-600 underline">
                          Terms and Conditions
                        </a>
                      </Label>
                    </div>
                    {form.formState.errors.terms_accepted && (
                      <p className="text-sm text-red-500">{form.formState.errors.terms_accepted.message}</p>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="privacy_accepted"
                        checked={form.watch('privacy_accepted')}
                        onCheckedChange={(checked) => form.setValue('privacy_accepted', checked as boolean)}
                      />
                      <Label htmlFor="privacy_accepted" className="text-sm">
                        I accept the{' '}
                        <a href="/privacy" className="text-coral-500 hover:text-coral-600 underline">
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                    {form.formState.errors.privacy_accepted && (
                      <p className="text-sm text-red-500">{form.formState.errors.privacy_accepted.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary"
                  >
                    {loading ? (
                      <>
                        <div className="spinner mr-2" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Booking
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
