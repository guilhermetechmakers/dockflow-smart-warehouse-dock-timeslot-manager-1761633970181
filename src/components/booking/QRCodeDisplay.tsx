import { QrCode, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  bookingReference: string;
  onPrint?: () => void;
  onShare?: () => void;
  className?: string;
}

export function QRCodeDisplay({ 
  qrCodeUrl, 
  bookingReference, 
  onPrint, 
  onShare,
  className 
}: QRCodeDisplayProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
    } else {
      const shareData = {
        title: 'DockFlow Booking QR Code',
        text: `Booking ${bookingReference} - Present this QR code at the gate`,
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
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Booking QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
            <img 
              src={qrCodeUrl} 
              alt={`Booking QR Code for ${bookingReference}`}
              className="w-32 h-32"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Present this QR code at the gate
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Reference: {bookingReference}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
