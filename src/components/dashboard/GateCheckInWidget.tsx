import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Camera, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Truck,
  Clock,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { LiveBooking } from '@/types/dashboard';

interface GateCheckInWidgetProps {
  onQRScan?: () => void;
  onPlateSearch?: (plateNumber: string) => void;
  onBookingSelect?: (booking: LiveBooking) => void;
  className?: string;
}

interface BookingSearchResult {
  booking: LiveBooking;
  matchType: 'exact' | 'partial';
}

export function GateCheckInWidget({
  onQRScan,
  onPlateSearch,
  onBookingSelect,
  className
}: GateCheckInWidgetProps) {
  const [plateNumber, setPlateNumber] = useState('');
  const [searchResults, setSearchResults] = useState<BookingSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<LiveBooking | null>(null);

  const handlePlateSearch = async () => {
    if (!plateNumber.trim()) return;
    
    setIsSearching(true);
    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockResults: BookingSearchResult[] = [
        {
          booking: {
            id: '1',
            booking_id: 'BK001',
            carrier_name: 'ABC Transport',
            trailer_plate: plateNumber.toUpperCase(),
            dock_id: 'dock-1',
            dock_name: 'Dock 1',
            status: 'confirmed',
            eta: new Date().toISOString(),
            pallets: 24,
            adr_declarations: ['General Freight'],
            temperature_controlled: false,
            hazmat: false,
            priority: 'medium',
            notes: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          matchType: 'exact'
        }
      ];
      
      setSearchResults(mockResults);
      onPlateSearch?.(plateNumber);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookingSelect = (booking: LiveBooking) => {
    setSelectedBooking(booking);
    onBookingSelect?.(booking);
  };

  const handleQRScan = () => {
    onQRScan?.();
    // In a real implementation, this would open a camera viewfinder
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress':
        return 'bg-coral-100 text-coral-800 border-coral-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'arrived':
        return <Truck className="h-4 w-4" />;
      case 'waiting':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-dark flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Gate Check-In
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* QR Code Scanner Button */}
        <Button
          onClick={handleQRScan}
          className="w-full h-12 bg-coral-500 hover:bg-coral-600 text-white font-medium"
        >
          <Camera className="h-5 w-5 mr-2" />
          Scan QR Code
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Manual Plate Entry */}
        <div className="space-y-2">
          <Label htmlFor="plate-number" className="text-sm font-medium text-dark">
            Enter License Plate
          </Label>
          <div className="flex gap-2">
            <Input
              id="plate-number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="ABC-1234"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handlePlateSearch()}
            />
            <Button
              onClick={handlePlateSearch}
              disabled={!plateNumber.trim() || isSearching}
              variant="outline"
              className="px-4"
            >
              {isSearching ? (
                <div className="animate-spin h-4 w-4 border-2 border-coral-500 border-t-transparent rounded-full" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-dark">Search Results</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.booking.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm',
                    'hover:bg-gray-50',
                    selectedBooking?.id === result.booking.id && 'ring-2 ring-coral-200 bg-coral-50'
                  )}
                  onClick={() => handleBookingSelect(result.booking)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg border',
                      getStatusColor(result.booking.status)
                    )}>
                      {getStatusIcon(result.booking.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-medium text-dark truncate">
                          {result.booking.carrier_name}
                        </h5>
                        <Badge variant="outline" className="text-xs">
                          {result.booking.trailer_plate}
                        </Badge>
                        {result.matchType === 'exact' && (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                            Exact Match
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>Dock {result.booking.dock_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            ETA: {new Date(result.booking.eta).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Truck className="h-3 w-3" />
                          <span>{result.booking.pallets} pallets</span>
                        </div>
                        
                        {result.booking.hazmat && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>HAZMAT</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Booking Actions */}
        {selectedBooking && (
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-dark">
                  Booking Selected
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // Handle check-in action
                    console.log('Check-in booking:', selectedBooking.id);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBooking(null);
                    setSearchResults([]);
                    setPlateNumber('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}