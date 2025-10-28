import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import gate components
import { QRScanner } from '@/components/gate/QRScanner';
import { ManualEntryForm } from '@/components/gate/ManualEntryForm';
import { BookingSummaryCard } from '@/components/gate/BookingSummaryCard';
import { StatusUpdateButtons } from '@/components/gate/StatusUpdateButtons';
import { NotesAndTimestamps } from '@/components/gate/NotesAndTimestamps';
import { PhotoCapture } from '@/components/gate/PhotoCapture';
import { RampAssignment } from '@/components/gate/RampAssignment';

// Import hooks
import { useGateCheckIn } from '@/hooks/useGateCheckIn';
import type { 
  RampAssignment as RampAssignmentType,
  GateEvent,
} from '@/types/gate';

export function GateCheckInPage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');

  // Use the gate check-in hook
  const {
    currentBooking,
    isOnline,
    scanQR,
    lookupPlate,
    updateStatus,
    assignRamp,
    addNote,
    uploadFile,
    clearBooking,
  } = useGateCheckIn({
    visitId: undefined,
    onBookingFound: (booking) => {
      console.log('Booking found:', booking);
    },
    onStatusUpdate: (status) => {
      console.log('Status updated:', status);
    },
    onRampAssigned: (ramp) => {
      console.log('Ramp assigned:', ramp);
    },
    onNoteAdded: (note) => {
      console.log('Note added:', note);
    },
  });

  // Mock data for development
  const mockRamps: RampAssignmentType[] = [
    { id: '1', name: 'Ramp A1', dock_id: 'dock1', status: 'available', priority: 1 },
    { id: '2', name: 'Ramp A2', dock_id: 'dock1', status: 'available', priority: 2 },
    { id: '3', name: 'Ramp B1', dock_id: 'dock2', status: 'occupied', priority: 1, current_booking_id: 'booking123' },
    { id: '4', name: 'Ramp B2', dock_id: 'dock2', status: 'maintenance', priority: 3 },
  ];

  const mockEvents: GateEvent[] = [
    {
      id: '1',
      gate_check_in_id: 'checkin1',
      event_type: 'scanned',
      timestamp: new Date().toISOString(),
      actor_name: 'Gate Operator',
    },
    {
      id: '2',
      gate_check_in_id: 'checkin1',
      event_type: 'arrived',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      actor_name: 'Gate Operator',
    },
  ];

  // Handle clear booking
  const handleClearBooking = () => {
    clearBooking();
    setActiveTab('scan');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gate Check-In</h1>
                <p className="text-sm text-gray-600">Scan QR code or enter plate number</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Online/Offline Status */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  isOnline ? 'text-green-600' : 'text-red-600'
                )}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {!currentBooking ? (
          /* Scan/Manual Entry */
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scan' | 'manual')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="scan" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  QR Scan
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="scan">
                <QRScanner
                  onScan={scanQR}
                  className="max-w-2xl mx-auto"
                />
              </TabsContent>
              
              <TabsContent value="manual">
                <ManualEntryForm
                  onLookup={async (data) => {
                    return new Promise((resolve, reject) => {
                      lookupPlate({ plate_number: data.plate_number, carrier_name: data.carrier_name }, {
                        onSuccess: (result) => resolve(result),
                        onError: (error) => reject(error)
                      });
                    });
                  }}
                  onSuccess={(result) => {
                    if (result.valid) {
                      scanQR(result.booking_token!);
                    }
                  }}
                  className="max-w-2xl mx-auto"
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Booking Management */
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Booking Summary */}
            <BookingSummaryCard
              booking={currentBooking}
              className="mb-6"
            />

            {/* Action Buttons */}
            <div className="flex justify-end">
              <Button
                onClick={handleClearBooking}
                variant="outline"
                className="text-gray-600 hover:text-gray-900"
              >
                Clear & Start New
              </Button>
            </div>

            {/* Main Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <StatusUpdateButtons
                  currentStatus={currentBooking.status}
                  onStatusUpdate={async (status) => {
                    await updateStatus({ status, notes: '' });
                  }}
                />
                
                <RampAssignment
                  visitId={currentBooking.visit_id}
                  currentRamp={currentBooking.ramp_assignment}
                  onAssign={async (data) => {
                    await assignRamp(data);
                  }}
                  onUnassign={async () => {
                    // Mock unassign - in real app this would be a separate API call
                    console.log('Unassign ramp');
                  }}
                  ramps={mockRamps}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <NotesAndTimestamps
                  visitId={currentBooking.visit_id}
                  onAddNote={async (data) => {
                    await addNote(data);
                  }}
                  events={mockEvents}
                />
                
                <PhotoCapture
                  onCapture={async (file) => {
                    await uploadFile({ file, fileType: 'photo' });
                  }}
                  onUpload={async (file) => {
                    await uploadFile({ file, fileType: 'document' });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
