import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Truck, 
  Calendar, 
  Package, 
  Thermometer, 
  AlertTriangle, 
  Shield, 
  Wrench,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GateCheckIn, GateStatus } from '@/types/gate';

interface BookingSummaryCardProps {
  booking: GateCheckIn;
  className?: string;
}

const statusConfig: Record<GateStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  arrived: { label: 'Arrived', variant: 'success' },
  waiting: { label: 'Waiting', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export function BookingSummaryCard({ booking, className }: BookingSummaryCardProps) {
  const statusInfo = statusConfig[booking.status];

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  return (
    <Card className={cn('dockflow-card dockflow-card-hover', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Booking Summary
          </CardTitle>
          <Badge variant={statusInfo.variant} className="text-sm font-medium">
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                Carrier
              </h4>
              <p className="text-lg font-semibold text-gray-900">
                {booking.carrier_name}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                License Plate
              </h4>
              <p className="text-lg font-mono font-semibold text-gray-900 tracking-wider">
                {booking.trailer_plate}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                Expected Arrival
              </h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-900">
                  {formatDateTime(booking.eta)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                Pallets
              </h4>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <p className="text-lg font-semibold text-gray-900">
                  {booking.pallets}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Driver Information */}
        {(booking.driver_name || booking.driver_phone || booking.driver_email) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Driver Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {booking.driver_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{booking.driver_name}</span>
                </div>
              )}
              {booking.driver_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{booking.driver_phone}</span>
                </div>
              )}
              {booking.driver_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{booking.driver_email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cargo Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Cargo Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ADR Declarations */}
            {booking.adr_declarations && booking.adr_declarations.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  ADR Declarations
                </h5>
                <div className="flex flex-wrap gap-1">
                  {booking.adr_declarations.map((declaration, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {declaration}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Special Equipment */}
            {booking.special_equipment && booking.special_equipment.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Special Equipment
                </h5>
                <div className="flex flex-wrap gap-1">
                  {booking.special_equipment.map((equipment, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Special Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {booking.temperature_controlled && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Thermometer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Temperature Controlled</span>
              </div>
            )}
            
            {booking.hazmat && (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Hazmat</span>
              </div>
            )}
            
            {booking.tailgate_required && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                <Wrench className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Tailgate Required</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Booking Reference */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Booking Reference
          </h4>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {booking.booking_token.substring(0, 12)}...
            </code>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span> {formatDateTime(booking.created_at)}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {formatDateTime(booking.updated_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}