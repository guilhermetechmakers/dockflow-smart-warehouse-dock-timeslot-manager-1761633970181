import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  MoreHorizontal,
  Truck,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Package,
  AlertTriangle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { VisitDetail } from '@/types/visit-detail';

interface VisitHeaderProps {
  visit: VisitDetail;
  onBack?: () => void;
  onEdit?: () => void;
  onExport?: () => void;
  onStatusChange?: (status: string) => void;
  onRampAssign?: (ramp: string) => void;
  canEdit?: boolean;
  canExport?: boolean;
  canChangeStatus?: boolean;
  canAssignRamp?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  arrived: 'bg-green-100 text-green-800',
  waiting: 'bg-orange-100 text-orange-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  arrived: 'Arrived',
  waiting: 'Waiting',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export function VisitHeader({
  visit,
  onBack,
  onEdit,
  onExport,
  onStatusChange,
  onRampAssign,
  canEdit = false,
  canExport = false,
  canChangeStatus = false,
  canAssignRamp = false
}: VisitHeaderProps) {
  const isDelayed = visit.delay_analysis?.delay_minutes && visit.delay_analysis.delay_minutes > 0;
  const hasDisputes = visit.disputes && visit.disputes.length > 0;
  const openDisputes = visit.disputes?.filter(d => d.status === 'open').length || 0;

  return (
    <Card className="dockflow-card">
      <CardContent className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Visit #{visit.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-500">
                {visit.warehouse.name} • {visit.dock.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}

            {canExport && onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canChangeStatus && onStatusChange && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusChange('arrived')}>
                      Mark as Arrived
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange('in_progress')}>
                      Start Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canAssignRamp && onRampAssign && (
                  <DropdownMenuItem onClick={() => onRampAssign('')}>
                    Assign Ramp
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => window.print()}>
                  Print Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status and Alerts */}
        <div className="flex items-center gap-4 mb-6">
          <Badge 
            className={`${statusColors[visit.status]} text-sm font-medium px-3 py-1`}
          >
            {statusLabels[visit.status]}
          </Badge>

          {isDelayed && (
            <Badge variant="destructive" className="text-sm font-medium px-3 py-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Delayed
            </Badge>
          )}

          {hasDisputes && (
            <Badge variant="outline" className="text-sm font-medium px-3 py-1 border-orange-200 text-orange-700">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {openDisputes} Open Dispute{openDisputes !== 1 ? 's' : ''}
            </Badge>
          )}

          {visit.ramp_assignment && (
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
              <MapPin className="h-3 w-3 mr-1" />
              Ramp {visit.ramp_assignment}
            </Badge>
          )}
        </div>

        {/* Visit Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carrier Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-coral-500" />
              Carrier Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Company:</span>
                <span className="ml-2 font-medium">{visit.booking.carrier_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Trailer:</span>
                <span className="ml-2 font-medium">{visit.booking.trailer_plate}</span>
              </div>
              {visit.booking.driver_name && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">Driver:</span>
                  <span className="ml-1 font-medium">{visit.booking.driver_name}</span>
                </div>
              )}
              {visit.booking.driver_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-1 font-medium">{visit.booking.driver_phone}</span>
                </div>
              )}
              {visit.booking.driver_email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-1 font-medium">{visit.booking.driver_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-coral-500" />
              Schedule
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Planned Start:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(visit.planned_start), 'MMM d, h:mm a')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Planned End:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(visit.planned_end), 'MMM d, h:mm a')}
                </span>
              </div>
              {visit.actual_start && (
                <div>
                  <span className="text-gray-600">Actual Start:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(visit.actual_start), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
              {visit.actual_end && (
                <div>
                  <span className="text-gray-600">Actual End:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(visit.actual_end), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cargo Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-coral-500" />
              Cargo Details
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Pallets:</span>
                <span className="ml-2 font-medium">{visit.booking.pallets}</span>
              </div>
              {visit.booking.temperature_controlled && (
                <div>
                  <span className="text-gray-600">Temperature Controlled:</span>
                  <span className="ml-2 font-medium text-green-600">Yes</span>
                </div>
              )}
              {visit.booking.hazmat && (
                <div>
                  <span className="text-gray-600">Hazmat:</span>
                  <span className="ml-2 font-medium text-red-600">Yes</span>
                </div>
              )}
              {visit.booking.tailgate_required && (
                <div>
                  <span className="text-gray-600">Tailgate Required:</span>
                  <span className="ml-2 font-medium">Yes</span>
                </div>
              )}
              {visit.booking.adr_declarations.length > 0 && (
                <div>
                  <span className="text-gray-600">ADR Declarations:</span>
                  <div className="mt-1">
                    {visit.booking.adr_declarations.map((declaration, index) => (
                      <Badge key={index} variant="outline" className="text-xs mr-1">
                        {declaration}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}