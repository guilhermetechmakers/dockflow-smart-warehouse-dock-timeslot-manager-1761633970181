import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Mail,
  Clock,
  FileText,
  Table,
  BarChart3,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const exportOptionsSchema = z.object({
  format: z.enum(['csv', 'pdf', 'excel']),
  scheduled: z.boolean(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  scheduled_time: z.string().optional(),
  recipients: z.array(z.string()).optional(),
  email_subject: z.string().optional(),
  email_message: z.string().optional(),
});

type ExportOptionsFormData = z.infer<typeof exportOptionsSchema>;

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: ExportOptionsFormData) => void;
  onSchedule?: (data: ExportOptionsFormData) => void;
  reportName: string;
  isLoading?: boolean;
}

const formatOptions = [
  { id: 'csv', name: 'CSV', description: 'Comma-separated values', icon: Table },
  { id: 'excel', name: 'Excel', description: 'Microsoft Excel format', icon: BarChart3 },
  { id: 'pdf', name: 'PDF', description: 'Portable Document Format', icon: FileText },
];

const frequencyOptions = [
  { id: 'daily', name: 'Daily', description: 'Every day at the specified time' },
  { id: 'weekly', name: 'Weekly', description: 'Every week on the specified day' },
  { id: 'monthly', name: 'Monthly', description: 'Every month on the specified date' },
];

export function ExportOptionsModal({
  isOpen,
  onClose,
  onExport,
  onSchedule,
  reportName,
  isLoading = false
}: ExportOptionsModalProps) {
  const [newRecipient, setNewRecipient] = useState('');
  const [activeTab, setActiveTab] = useState('export');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<ExportOptionsFormData>({
    resolver: zodResolver(exportOptionsSchema),
    defaultValues: {
      format: 'csv',
      scheduled: false,
      recipients: [],
      email_subject: `Report: ${reportName}`,
      email_message: `Please find the attached report: ${reportName}`,
    },
  });

  const watchedValues = watch();

  const addRecipient = () => {
    if (newRecipient.trim() && !watchedValues.recipients?.includes(newRecipient.trim())) {
      const currentRecipients = watchedValues.recipients || [];
      setValue('recipients', [...currentRecipients, newRecipient.trim()]);
      setNewRecipient('');
    }
  };

  const removeRecipient = (recipientToRemove: string) => {
    const currentRecipients = watchedValues.recipients || [];
    setValue('recipients', currentRecipients.filter(recipient => recipient !== recipientToRemove));
  };

  const handleFormSubmit = (data: ExportOptionsFormData) => {
    if (data.scheduled && onSchedule) {
      onSchedule(data);
    } else {
      onExport(data);
    }
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Options</DialogTitle>
          <DialogDescription>
            Choose how you want to export "{reportName}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export Now</TabsTrigger>
              <TabsTrigger value="schedule">Schedule Export</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Export Format</Label>
                <div className="grid grid-cols-1 gap-3">
                  {formatOptions.map((format) => (
                    <div
                      key={format.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                        watchedValues.format === format.id
                          ? "border-coral-500 bg-coral-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setValue('format', format.id as any)}
                    >
                      <format.icon className="h-5 w-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-medium">{format.name}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </div>
                      <input
                        type="radio"
                        checked={watchedValues.format === format.id}
                        onChange={() => setValue('format', format.id as any)}
                        className="h-4 w-4 text-coral-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              {/* Schedule Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scheduled"
                    checked={watchedValues.scheduled}
                    onCheckedChange={(checked) => setValue('scheduled', !!checked)}
                  />
                  <Label htmlFor="scheduled" className="text-base font-medium">
                    Enable scheduled export
                  </Label>
                </div>

                {watchedValues.scheduled && (
                  <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                    {/* Frequency */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Frequency</Label>
                      <Select
                        value={watchedValues.frequency}
                        onValueChange={(value) => setValue('frequency', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              <div>
                                <div className="font-medium">{option.name}</div>
                                <div className="text-xs text-gray-600">{option.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Scheduled Time */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Time</Label>
                      <Input
                        type="time"
                        value={watchedValues.scheduled_time || ''}
                        onChange={(e) => setValue('scheduled_time', e.target.value)}
                        className="w-32"
                      />
                    </div>

                    {/* Format Selection for Scheduled */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Export Format</Label>
                      <Select
                        value={watchedValues.format}
                        onValueChange={(value) => setValue('format', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formatOptions.map((format) => (
                            <SelectItem key={format.id} value={format.id}>
                              {format.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Email Settings */}
          {(watchedValues.scheduled || activeTab === 'schedule') && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-600" />
                <Label className="text-base font-medium">Email Settings</Label>
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Recipients</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="Enter email address"
                    type="email"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRecipient();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addRecipient}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {watchedValues.recipients && watchedValues.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.recipients.map((recipient) => (
                      <Badge key={recipient} variant="secondary" className="text-xs">
                        {recipient}
                        <button
                          type="button"
                          onClick={() => removeRecipient(recipient)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Email Subject */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email Subject</Label>
                <Input
                  {...register('email_subject')}
                  placeholder="Enter email subject"
                />
              </div>

              {/* Email Message */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email Message</Label>
                <textarea
                  {...register('email_message')}
                  placeholder="Enter email message"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Report: {reportName}</div>
              <div>Format: {formatOptions.find(f => f.id === watchedValues.format)?.name}</div>
              {watchedValues.scheduled && (
                <>
                  <div>Frequency: {frequencyOptions.find(f => f.id === watchedValues.frequency)?.name}</div>
                  <div>Time: {watchedValues.scheduled_time || 'Not specified'}</div>
                  {watchedValues.recipients && watchedValues.recipients.length > 0 && (
                    <div>Recipients: {watchedValues.recipients.length} email(s)</div>
                  )}
                </>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(handleFormSubmit)} 
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {watchedValues.scheduled ? 'Schedule Export' : 'Export Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}