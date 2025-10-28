import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, 
  CameraOff, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  onCapture: (file: File) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

export function PhotoCapture({ onCapture, onUpload, className }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // File created for potential future use
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        setIsCapturing(false);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera]);

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      await startCamera();
    } catch (err) {
      console.error('Error starting camera:', err);
    }
  };

  const handleConfirmCapture = async () => {
    if (!capturedImage) return;

    try {
      setIsUploading(true);
      setError(null);

      // Convert image URL back to file
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

      await onCapture(file);
      
      setCapturedImage(null);
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save photo';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      await onUpload(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
  };

  const handleCloseDialog = () => {
    setCapturedImage(null);
    setError(null);
    stopCamera();
    setIsDialogOpen(false);
  };

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photo & Documents
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Photo Capture */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleCapture}
                disabled={isUploading}
                className="btn-primary h-auto p-4 flex flex-col items-center gap-2"
              >
                <Camera className="h-6 w-6" />
                <span>Take Photo</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Capture Photo</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {!capturedImage ? (
                  <div className="space-y-4">
                    {/* Camera View */}
                    <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video">
                      {!isCapturing ? (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                          <div className="text-center space-y-4">
                            <CameraOff className="h-12 w-12 text-gray-400 mx-auto" />
                            <p className="text-gray-500">Camera not active</p>
                            <Button onClick={handleCapture} className="btn-primary">
                              <Camera className="h-4 w-4 mr-2" />
                              Start Camera
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
                          
                          {/* Capture Overlay */}
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
                          </div>
                        </>
                      )}
                    </div>

                    {/* Camera Controls */}
                    {isCapturing && (
                      <div className="flex justify-center gap-3">
                        <Button
                          onClick={capturePhoto}
                          className="btn-primary"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capture
                        </Button>
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                        >
                          <CameraOff className="h-4 w-4 mr-2" />
                          Stop Camera
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Captured Image Preview */}
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured photo"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <Button
                        onClick={handleRetake}
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Confirm/Cancel Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleConfirmCapture}
                        disabled={isUploading}
                        className="flex-1 btn-primary"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Save Photo
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleRetake}
                        variant="outline"
                        className="flex-1"
                      >
                        Retake
                      </Button>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleCloseDialog}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
              <span>Upload File</span>
            </Button>
          </div>
        </div>

        {/* File Type Info */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Photos: JPG, PNG, WebP</p>
          <p>• Documents: PDF, DOC, DOCX</p>
          <p>• Maximum file size: 10MB</p>
        </div>

        {/* Quick Upload Buttons */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Quick Upload
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Trailer Photo', icon: ImageIcon, type: 'image/*' },
              { label: 'Documents', icon: FileText, type: '.pdf,.doc,.docx' },
            ].map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center gap-1"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = item.type;
                    fileInputRef.current.click();
                  }
                }}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}