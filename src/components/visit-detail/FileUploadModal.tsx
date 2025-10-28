import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, metadata?: { description?: string; tags?: string[] }) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

const fileTypeIcons = {
  'image/*': Image,
  'application/pdf': FileText,
  'text/*': FileText,
  'application/*': File,
  'default': File,
};

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith('image/')) return fileTypeIcons['image/*'];
  if (type === 'application/pdf') return fileTypeIcons['application/pdf'];
  if (type.startsWith('text/')) return fileTypeIcons['text/*'];
  if (type.startsWith('application/')) return fileTypeIcons['application/*'];
  return fileTypeIcons['default'];
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUploadModal({
  isOpen,
  onClose,
  onUpload,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/*', 'application/pdf', 'text/*', 'application/*']
}: FileUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [tagInput, setTagInput] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, maxFiles - files.length);
    setFiles(prev => [...prev, ...newFiles]);
    
    // Initialize descriptions and tags for new files
    newFiles.forEach(file => {
      setDescriptions(prev => ({ ...prev, [file.name]: '' }));
      setTags(prev => ({ ...prev, [file.name]: [] }));
      setTagInput(prev => ({ ...prev, [file.name]: '' }));
    });
  }, [files.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled: files.length >= maxFiles
  });

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    setDescriptions(prev => {
      const newDesc = { ...prev };
      delete newDesc[fileName];
      return newDesc;
    });
    setTags(prev => {
      const newTags = { ...prev };
      delete newTags[fileName];
      return newTags;
    });
    setTagInput(prev => {
      const newTagInput = { ...prev };
      delete newTagInput[fileName];
      return newTagInput;
    });
  };

  const addTag = (fileName: string) => {
    const tag = tagInput[fileName]?.trim();
    if (tag && !tags[fileName]?.includes(tag)) {
      setTags(prev => ({
        ...prev,
        [fileName]: [...(prev[fileName] || []), tag]
      }));
      setTagInput(prev => ({ ...prev, [fileName]: '' }));
    }
  };

  const removeTag = (fileName: string, tagToRemove: string) => {
    setTags(prev => ({
      ...prev,
      [fileName]: prev[fileName]?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const metadata = {
          description: descriptions[file.name] || undefined,
          tags: tags[file.name] || undefined,
        };
        await onUpload(file, metadata);
      }
      
      // Reset state
      setFiles([]);
      setDescriptions({});
      setTags({});
      setTagInput({});
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      setDescriptions({});
      setTags({});
      setTagInput({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-coral-500" />
            Upload Files
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-coral-500 bg-coral-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-coral-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Max {maxFiles} files, up to {formatFileSize(maxSize)} each
                </p>
              </div>
            )}
          </div>

          {/* File rejections */}
          {fileRejections.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Some files were rejected:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {fileRejections.map(({ file, errors }) => (
                  <li key={file.name}>
                    <strong>{file.name}</strong>: {errors.map(e => e.message).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Selected files */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Selected Files ({files.length})
              </h3>
              
              {files.map((file) => {
                const Icon = getFileIcon(file);
                const fileTags = tags[file.name] || [];
                const fileDescription = descriptions[file.name] || '';
                const fileTagInput = tagInput[file.name] || '';

                return (
                  <div key={file.name} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-3">
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </p>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor={`desc-${file.name}`} className="text-sm">
                            Description (optional)
                          </Label>
                          <Textarea
                            id={`desc-${file.name}`}
                            placeholder="Add a description for this file..."
                            value={fileDescription}
                            onChange={(e) => setDescriptions(prev => ({
                              ...prev,
                              [file.name]: e.target.value
                            }))}
                            className="min-h-[60px]"
                          />
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                          <Label className="text-sm">Tags (optional)</Label>
                          
                          {/* Existing tags */}
                          {fileTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {fileTags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => removeTag(file.name, tag)}
                                    className="ml-1 hover:text-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Add tag input */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a tag..."
                              value={fileTagInput}
                              onChange={(e) => setTagInput(prev => ({
                                ...prev,
                                [file.name]: e.target.value
                              }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag(file.name);
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTag(file.name)}
                              disabled={!fileTagInput.trim()}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="btn-primary"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} file{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}