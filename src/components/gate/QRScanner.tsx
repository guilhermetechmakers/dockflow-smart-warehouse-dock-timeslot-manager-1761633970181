import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simple QR code detection (in a real app, you'd use a library like jsQR)
  const detectQRCode = useCallback((imageData: ImageData) => {
    // This is a simplified QR detection - in production, use a proper QR library
    // For now, we'll simulate detection by looking for patterns
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple pattern detection (this is just a placeholder)
    // In reality, you'd use jsQR or similar library
    const qrPattern = findQRPattern(data, width, height);
    
    if (qrPattern) {
      return qrPattern;
    }
    
    return null;
  }, []);

  const findQRPattern = (data: Uint8ClampedArray, width: number, height: number): string | null => {
    // This is a mock implementation - replace with actual QR detection
    // For demo purposes, we'll return a mock QR code when certain conditions are met
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Check for a simple pattern in the center of the image
    const pixelIndex = (centerY * width + centerX) * 4;
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];
    
    // If the center pixel is dark, simulate a QR code detection
    if (r < 100 && g < 100 && b < 100) {
      return `MOCK_QR_${Date.now()}`;
    }
    
    return null;
  };

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsProcessing(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setHasPermission(true);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start scanning loop
      scanLoop();
    } catch (err) {
      console.error('Error accessing camera:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      setHasPermission(false);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onError]);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setScanResult(null);
  }, []);

  const scanLoop = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrData = detectQRCode(imageData);

    if (qrData) {
      setScanResult(qrData);
      onScan(qrData);
      stopScanning();
    } else {
      // Continue scanning
      requestAnimationFrame(scanLoop);
    }
  }, [isScanning, detectQRCode, onScan, stopScanning]);

  const handleManualEntry = () => {
    const manualData = prompt('Enter QR code data manually:');
    if (manualData) {
      onScan(manualData);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          QR Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video">
          {!isScanning ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center space-y-4">
                <CameraOff className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-gray-500">Camera not active</p>
                <Button
                  onClick={startScanning}
                  disabled={isProcessing}
                  className="btn-primary"
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner mr-2" />
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Scanning
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-coral-500 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-coral-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-coral-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-coral-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-coral-500 rounded-br-lg" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <p className="text-white text-sm font-medium">Position QR code within the frame</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {scanResult && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              QR code detected successfully!
            </AlertDescription>
          </Alert>
        )}

        {hasPermission === false && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Camera permission denied. Please enable camera access in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isScanning ? (
            <Button
              onClick={stopScanning}
              variant="outline"
              className="flex-1"
            >
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          ) : (
            <Button
              onClick={startScanning}
              disabled={isProcessing}
              className="flex-1 btn-primary"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          )}
          
          <Button
            onClick={handleManualEntry}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Position the QR code within the scanning frame</p>
          <p>• Ensure good lighting for better detection</p>
          <p>• Use manual entry if QR code is damaged</p>
        </div>
      </CardContent>
    </Card>
  );
}