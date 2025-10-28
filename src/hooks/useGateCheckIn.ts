import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gateApi } from '@/api/gate';
import { useGateRealTime } from './useGateRealTime';
import type { 
  GateCheckIn, 
  QRScanResult, 
  PlateLookupResult, 
  NotesForm, 
  RampAssignmentForm,
  GateStatus 
} from '@/types/gate';

interface UseGateCheckInOptions {
  visitId?: string;
  onBookingFound?: (booking: GateCheckIn) => void;
  onStatusUpdate?: (status: GateStatus) => void;
  onRampAssigned?: (ramp: string) => void;
  onNoteAdded?: (note: string) => void;
}

export function useGateCheckIn({
  visitId,
  onBookingFound,
  onStatusUpdate,
  onRampAssigned,
  onNoteAdded,
}: UseGateCheckInOptions = {}) {
  const [currentBooking, setCurrentBooking] = useState<GateCheckIn | null>(null);
  
  const { 
    isOnline, 
    sendMessage, 
    storeOfflineEvent 
  } = useGateRealTime({
    visitId,
    onStatusUpdate: (data) => {
      if (currentBooking) {
        setCurrentBooking(prev => prev ? { ...prev, status: data.status } : null);
      }
    },
    onRampAssignment: (data) => {
      if (currentBooking) {
        setCurrentBooking(prev => prev ? { ...prev, ramp_assignment: data.ramp } : null);
      }
    },
  });

  // QR Code scanning
  const scanQRMutation = useMutation({
    mutationFn: async (qrData: string) => {
      if (isOnline) {
        return await gateApi.scanQRCode(qrData);
      } else {
        // Store for offline processing
        storeOfflineEvent('qr_scan', { qr_data: qrData });
        throw new Error('Offline - QR scan queued for processing');
      }
    },
    onSuccess: (result: QRScanResult) => {
      if (result.valid && result.booking_id) {
        // Fetch booking details
        fetchBookingDetails(result.booking_id);
      } else {
        toast.error('Invalid QR code');
      }
    },
    onError: (error) => {
      console.error('QR scan error:', error);
      toast.error(error.message || 'Failed to scan QR code');
    },
  });

  // Manual plate lookup
  const lookupPlateMutation = useMutation({
    mutationFn: async (data: { plate_number: string; carrier_name?: string }) => {
      if (isOnline) {
        return await gateApi.lookupByPlate(data.plate_number, data.carrier_name);
      } else {
        // Store for offline processing
        storeOfflineEvent('plate_lookup', data);
        throw new Error('Offline - Plate lookup queued for processing');
      }
    },
    onSuccess: (result: PlateLookupResult) => {
      if (result.valid && result.booking_id) {
        // Fetch booking details
        fetchBookingDetails(result.booking_id);
      } else {
        toast.error('No booking found for this plate number');
      }
    },
    onError: (error) => {
      console.error('Plate lookup error:', error);
      toast.error(error.message || 'Failed to lookup booking');
    },
  });

  // Fetch booking details
  const fetchBookingDetails = useCallback(async (bookingId: string) => {
    try {
      if (isOnline) {
        const booking = await gateApi.getCheckIn(bookingId);
        setCurrentBooking(booking);
        onBookingFound?.(booking);
        toast.success('Booking found successfully!');
      } else {
        toast.error('Cannot fetch booking details while offline');
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
      toast.error('Failed to load booking details');
    }
  }, [isOnline, onBookingFound]);

  // Status update
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: GateStatus; notes?: string }) => {
      if (!visitId) throw new Error('No visit ID provided');
      
      if (isOnline) {
        return await gateApi.updateStatus(visitId, status, notes);
      } else {
        // Store for offline processing
        storeOfflineEvent('status_update', { visit_id: visitId, status, notes });
        throw new Error('Offline - Status update queued for processing');
      }
    },
    onSuccess: (_, variables) => {
      setCurrentBooking(prev => prev ? { ...prev, status: variables.status } : null);
      onStatusUpdate?.(variables.status);
      
      // Send real-time update
      sendMessage({
        type: 'status_update',
        visit_id: visitId,
        status: variables.status,
        timestamp: new Date().toISOString(),
      });
      
      toast.success(`Status updated to ${variables.status.replace('_', ' ')}`);
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast.error(error.message || 'Failed to update status');
    },
  });

  // Ramp assignment
  const assignRampMutation = useMutation({
    mutationFn: async (data: RampAssignmentForm) => {
      if (!visitId) throw new Error('No visit ID provided');
      
      if (isOnline) {
        return await gateApi.assignRamp(visitId, data);
      } else {
        // Store for offline processing
        storeOfflineEvent('ramp_assignment', { visit_id: visitId, ...data });
        throw new Error('Offline - Ramp assignment queued for processing');
      }
    },
    onSuccess: (_, variables) => {
      const selectedRamp = variables.ramp_id; // In real app, get ramp name from response
      setCurrentBooking(prev => prev ? { ...prev, ramp_assignment: selectedRamp } : null);
      onRampAssigned?.(selectedRamp);
      
      // Send real-time update
      sendMessage({
        type: 'ramp_assignment',
        visit_id: visitId,
        ramp: selectedRamp,
        timestamp: new Date().toISOString(),
      });
      
      toast.success(`Ramp ${selectedRamp} assigned successfully`);
    },
    onError: (error) => {
      console.error('Ramp assignment error:', error);
      toast.error(error.message || 'Failed to assign ramp');
    },
  });

  // Add note
  const addNoteMutation = useMutation({
    mutationFn: async (data: NotesForm) => {
      if (!visitId) throw new Error('No visit ID provided');
      
      if (isOnline) {
        return await gateApi.addNote(visitId, data);
      } else {
        // Store for offline processing
        storeOfflineEvent('note_added', { visit_id: visitId, ...data });
        throw new Error('Offline - Note queued for processing');
      }
    },
    onSuccess: (_, variables) => {
      onNoteAdded?.(variables.note);
      
      // Send real-time update
      sendMessage({
        type: 'note_added',
        visit_id: visitId,
        note: variables.note,
        priority: variables.priority,
        category: variables.category,
        timestamp: new Date().toISOString(),
      });
      
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Add note error:', error);
      toast.error(error.message || 'Failed to add note');
    },
  });

  // Upload file
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, fileType }: { file: File; fileType: 'photo' | 'document' }) => {
      if (!visitId) throw new Error('No visit ID provided');
      
      if (isOnline) {
        return await gateApi.uploadFile(visitId, file, fileType);
      } else {
        // Store for offline processing
        storeOfflineEvent('file_upload', { 
          visit_id: visitId, 
          file_name: file.name, 
          file_type: fileType,
          file_size: file.size 
        });
        throw new Error('Offline - File upload queued for processing');
      }
    },
    onSuccess: (_, variables) => {
      // Send real-time update
      sendMessage({
        type: 'file_uploaded',
        visit_id: visitId,
        file_name: variables.file.name,
        file_type: variables.fileType,
        timestamp: new Date().toISOString(),
      });
      
      toast.success(`${variables.fileType === 'photo' ? 'Photo' : 'File'} uploaded successfully`);
    },
    onError: (error) => {
      console.error('File upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    },
  });

  // Clear current booking
  const clearBooking = useCallback(() => {
    setCurrentBooking(null);
  }, []);

  // Get available ramps
  const availableRamps = (useQueryClient().getQueryData(['ramps']) as { data: any[] } | undefined)?.data || [];

  return {
    // State
    currentBooking,
    isOnline,
    
    // Mutations
    scanQR: scanQRMutation.mutate,
    lookupPlate: lookupPlateMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    assignRamp: assignRampMutation.mutate,
    addNote: addNoteMutation.mutate,
    uploadFile: uploadFileMutation.mutate,
    
    // Loading states
    isScanning: scanQRMutation.isPending,
    isLookingUp: lookupPlateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isAssigningRamp: assignRampMutation.isPending,
    isAddingNote: addNoteMutation.isPending,
    isUploadingFile: uploadFileMutation.isPending,
    
    // Utilities
    clearBooking,
    availableRamps,
  };
}