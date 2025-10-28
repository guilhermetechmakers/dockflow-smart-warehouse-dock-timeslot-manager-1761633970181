import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  File,
  Calendar,
  User
} from 'lucide-react';
import { FileUploadModal } from './FileUploadModal';
import type { VisitFile } from '@/types/booking';

interface VisitFilesProps {
  files: VisitFile[];
  isLoading?: boolean;
  onUpload?: (file: File, metadata?: { description?: string; tags?: string[] }) => void;
  onDelete?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  canUpload?: boolean;
  canDelete?: boolean;
}

const fileTypeIcons = {
  image: Image,
  document: FileText,
  other: File,
};

const fileTypeColors = {
  image: 'bg-green-100 text-green-800',
  document: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800',
};

export function VisitFiles({ 
  files, 
  isLoading = false, 
  onUpload,
  onDelete,
  onDownload,
  canUpload = false,
  canDelete = false 
}: VisitFilesProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUpload = (file: File, metadata?: { description?: string; tags?: string[] }) => {
    onUpload?.(file, metadata);
    setShowUploadModal(false);
  };

  const handleDownload = async (file: VisitFile) => {
    if (onDownload) {
      onDownload(file.id);
    } else {
      // Fallback: open file URL in new tab
      window.open(file.file_url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card className="dockflow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-coral-500" />
            Files & Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="dockflow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-coral-500" />
              Files & Photos
              {files.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {files.length}
                </Badge>
              )}
            </CardTitle>
            {canUpload && (
              <Button 
                onClick={() => setShowUploadModal(true)}
                size="sm"
                className="btn-primary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No files uploaded yet</p>
              {canUpload && (
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const Icon = fileTypeIcons[file.file_type];
                const isImage = file.file_type === 'image';
                
                return (
                  <div 
                    key={file.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        flex h-10 w-10 items-center justify-center rounded-lg
                        ${fileTypeColors[file.file_type]}
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {file.filename}
                          </h4>
                          <Badge 
                            variant="secondary" 
                            className={fileTypeColors[file.file_type]}
                          >
                            {file.file_type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(file.uploaded_at), 'MMM d, h:mm a')}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                          <User className="h-3 w-3" />
                          <span>{file.uploaded_by}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file)}
                            className="flex-1"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          
                          {isImage && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(file.file_url, '_blank')}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete?.(file.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showUploadModal && (
        <FileUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}
    </>
  );
}