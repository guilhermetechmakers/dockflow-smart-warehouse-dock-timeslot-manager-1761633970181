import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  MessageSquare,
  Save,
  X,
  Eye,
  Clock,
  Settings,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['email', 'sms']),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean(),
  reminderSchedule: z.object({
    enabled: z.boolean(),
    times: z.array(z.string()).optional(),
  }).optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

interface NotificationTemplate extends TemplateForm {
  id: string;
  created_at: string;
  updated_at: string;
  last_sent?: string;
  send_count: number;
}

const templateTypes = [
  { id: 'email', name: 'Email', icon: Mail, description: 'Email notifications' },
  { id: 'sms', name: 'SMS', icon: MessageSquare, description: 'SMS text messages' },
];

const availableVariables = [
  { id: '{{carrier_name}}', name: 'Carrier Name', description: 'Name of the carrier company' },
  { id: '{{driver_name}}', name: 'Driver Name', description: 'Name of the driver' },
  { id: '{{trailer_number}}', name: 'Trailer Number', description: 'Trailer or truck number' },
  { id: '{{booking_reference}}', name: 'Booking Reference', description: 'Unique booking reference' },
  { id: '{{dock_number}}', name: 'Dock Number', description: 'Assigned dock number' },
  { id: '{{arrival_time}}', name: 'Arrival Time', description: 'Scheduled arrival time' },
  { id: '{{warehouse_name}}', name: 'Warehouse Name', description: 'Name of the warehouse' },
  { id: '{{warehouse_address}}', name: 'Warehouse Address', description: 'Full warehouse address' },
  { id: '{{contact_phone}}', name: 'Contact Phone', description: 'Warehouse contact phone' },
  { id: '{{contact_email}}', name: 'Contact Email', description: 'Warehouse contact email' },
  { id: '{{booking_link}}', name: 'Booking Link', description: 'Link to modify/cancel booking' },
  { id: '{{qr_code}}', name: 'QR Code', description: 'QR code for gate check-in' },
];

const reminderTimes = [
  { id: '24h', name: '24 hours before', value: '24' },
  { id: '2h', name: '2 hours before', value: '2' },
  { id: '1h', name: '1 hour before', value: '1' },
  { id: '30m', name: '30 minutes before', value: '30' },
  { id: '15m', name: '15 minutes before', value: '15' },
];

const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Booking Confirmation',
    type: 'email',
    subject: 'Booking Confirmed - {{warehouse_name}}',
    content: `Dear {{carrier_name}},

Your booking has been confirmed for {{arrival_time}} at {{warehouse_name}}.

Booking Details:
- Reference: {{booking_reference}}
- Dock: {{dock_number}}
- Trailer: {{trailer_number}}

Please arrive on time and present your QR code at the gate.

Warehouse Address:
{{warehouse_address}}

Contact: {{contact_phone}} | {{contact_email}}

{{booking_link}}

Best regards,
{{warehouse_name}} Team`,
    variables: ['{{carrier_name}}', '{{arrival_time}}', '{{warehouse_name}}', '{{booking_reference}}', '{{dock_number}}', '{{trailer_number}}', '{{warehouse_address}}', '{{contact_phone}}', '{{contact_email}}', '{{booking_link}}'],
    isActive: true,
    reminderSchedule: {
      enabled: true,
      times: ['24', '2'],
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_sent: '2024-01-20T14:30:00Z',
    send_count: 156,
  },
  {
    id: '2',
    name: 'Arrival Reminder',
    type: 'sms',
    subject: 'Arrival Reminder',
    content: `Hi {{driver_name}}, your {{warehouse_name}} appointment is in {{reminder_time}}. Dock {{dock_number}}. {{booking_link}}`,
    variables: ['{{driver_name}}', '{{warehouse_name}}', '{{dock_number}}', '{{booking_link}}'],
    isActive: true,
    reminderSchedule: {
      enabled: true,
      times: ['2', '1'],
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_sent: '2024-01-20T12:00:00Z',
    send_count: 89,
  },
  {
    id: '3',
    name: 'Visit Completed',
    type: 'email',
    subject: 'Visit Completed - {{warehouse_name}}',
    content: `Dear {{carrier_name}},

Your visit to {{warehouse_name}} has been completed.

Visit Details:
- Reference: {{booking_reference}}
- Dock: {{dock_number}}
- Completion Time: {{completion_time}}

Thank you for your business!

{{warehouse_name}} Team`,
    variables: ['{{carrier_name}}', '{{warehouse_name}}', '{{booking_reference}}', '{{dock_number}}', '{{completion_time}}'],
    isActive: false,
    reminderSchedule: {
      enabled: false,
      times: [],
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_sent: '2024-01-19T16:45:00Z',
    send_count: 23,
  },
];

export function NotificationTemplates() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: [],
      isActive: true,
      reminderSchedule: {
        enabled: false,
        times: [],
      },
    },
  });

  const selectedType = watch('type');
  const selectedVariables = watch('variables') || [];
  const selectedReminderTimes = watch('reminderSchedule.times') || [];

  const handleOpenDialog = (template?: NotificationTemplate) => {
    if (template) {
      setEditingTemplate(template);
      reset({
        name: template.name,
        type: template.type,
        subject: template.subject,
        content: template.content,
        variables: template.variables || [],
        isActive: template.isActive,
        reminderSchedule: template.reminderSchedule || {
          enabled: false,
          times: [],
        },
      });
    } else {
      setEditingTemplate(null);
      reset({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        variables: [],
        isActive: true,
        reminderSchedule: {
          enabled: false,
          times: [],
        },
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    reset();
    setPreviewMode(false);
  };

  const onSubmit = async (data: TemplateForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingTemplate) {
        setTemplates(prev => prev.map(template => 
          template.id === editingTemplate.id 
            ? { ...template, ...data, updated_at: new Date().toISOString() }
            : template
        ));
        toast.success('Template updated successfully');
      } else {
        const newTemplate: NotificationTemplate = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          send_count: 0,
        };
        setTemplates(prev => [...prev, newTemplate]);
        toast.success('Template created successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTemplates(prev => prev.filter(template => template.id !== templateId));
        toast.success('Template deleted successfully');
      } catch (error) {
        toast.error('Failed to delete template');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleVariable = (variableId: string) => {
    const currentVariables = selectedVariables || [];
    const newVariables = currentVariables.includes(variableId)
      ? currentVariables.filter(v => v !== variableId)
      : [...currentVariables, variableId];
    setValue('variables', newVariables, { shouldDirty: true });
  };

  const toggleReminderTime = (timeValue: string) => {
    const currentTimes = selectedReminderTimes || [];
    const newTimes = currentTimes.includes(timeValue)
      ? currentTimes.filter(t => t !== timeValue)
      : [...currentTimes, timeValue];
    setValue('reminderSchedule.times', newTimes, { shouldDirty: true });
  };

  const insertVariable = (variableId: string) => {
    const currentContent = watch('content') || '';
    const newContent = currentContent + variableId;
    setValue('content', newContent, { shouldDirty: true });
  };

  const getTypeIcon = (type: string) => {
    const typeObj = templateTypes.find(t => t.id === type);
    return typeObj ? typeObj.icon : Mail;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'email':
        return <Badge variant="default" className="text-xs">Email</Badge>;
      case 'sms':
        return <Badge variant="secondary" className="text-xs">SMS</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{type}</Badge>;
    }
  };

  const previewContent = (content: string) => {
    return content
      .replace(/\{\{carrier_name\}\}/g, 'ABC Transport')
      .replace(/\{\{driver_name\}\}/g, 'John Smith')
      .replace(/\{\{trailer_number\}\}/g, 'TR-12345')
      .replace(/\{\{booking_reference\}\}/g, 'BK-2024-001')
      .replace(/\{\{dock_number\}\}/g, 'A-01')
      .replace(/\{\{arrival_time\}\}/g, '2:00 PM')
      .replace(/\{\{warehouse_name\}\}/g, 'Main Warehouse')
      .replace(/\{\{warehouse_address\}\}/g, '123 Industrial Blvd, Chicago, IL 60601')
      .replace(/\{\{contact_phone\}\}/g, '+1 (555) 123-4567')
      .replace(/\{\{contact_email\}\}/g, 'warehouse@company.com')
      .replace(/\{\{booking_link\}\}/g, 'https://dockflow.app/book/warehouse-123')
      .replace(/\{\{qr_code\}\}/g, '[QR CODE]')
      .replace(/\{\{completion_time\}\}/g, '4:30 PM')
      .replace(/\{\{reminder_time\}\}/g, '2 hours');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
            <Bell className="h-6 w-6 text-coral-500" />
            Notification Templates
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage email and SMS notification templates
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName" className="form-label">
                    Template Name *
                  </Label>
                  <Input
                    id="templateName"
                    {...register('name')}
                    className="form-input"
                    placeholder="e.g., Booking Confirmation"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="templateType" className="form-label">
                    Template Type *
                  </Label>
                  <Select
                    value={selectedType}
                    onValueChange={(value: 'email' | 'sms') => setValue('type', value, { shouldDirty: true })}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="form-label">
                  Subject Line *
                </Label>
                <Input
                  id="subject"
                  {...register('subject')}
                  className="form-input"
                  placeholder="Enter subject line"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content" className="form-label">
                    Content *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      {previewMode ? 'Edit' : 'Preview'}
                    </Button>
                  </div>
                </div>
                {previewMode ? (
                  <div className="p-4 bg-gray-50 rounded-lg border min-h-[200px] whitespace-pre-wrap">
                    {previewContent(watch('content') || '')}
                  </div>
                ) : (
                  <Textarea
                    id="content"
                    {...register('content')}
                    className="form-input min-h-[200px]"
                    placeholder="Enter template content. Use variables like {{carrier_name}} for dynamic content."
                  />
                )}
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
              </div>

              <div>
                <Label className="form-label">Available Variables</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                  {availableVariables.map((variable) => (
                    <div
                      key={variable.id}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedVariables?.includes(variable.id)
                          ? 'bg-coral-50 border-coral-200 text-coral-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleVariable(variable.id)}
                    >
                      <div>
                        <div className="text-sm font-medium">{variable.name}</div>
                        <div className="text-xs text-gray-500">{variable.description}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {variable.id}
                        </code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            insertVariable(variable.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="form-label">Reminder Schedule</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={watch('reminderSchedule.enabled')}
                      onCheckedChange={(checked) => setValue('reminderSchedule.enabled', checked, { shouldDirty: true })}
                    />
                    <Label className="text-sm font-medium">
                      Enable automatic reminders
                    </Label>
                  </div>
                  {watch('reminderSchedule.enabled') && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">
                        Send reminders:
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {reminderTimes.map((time) => (
                          <div
                            key={time.id}
                            className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                              selectedReminderTimes?.includes(time.value)
                                ? 'bg-coral-50 border-coral-200 text-coral-700'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                            onClick={() => toggleReminderTime(time.value)}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedReminderTimes?.includes(time.value)
                                ? 'bg-coral-500 border-coral-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedReminderTimes?.includes(time.value) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-sm">{time.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
                />
                <Label className="text-sm font-medium">
                  Active
                </Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isDirty}
                  className="btn-primary flex items-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates List */}
      <Card className="dockflow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-coral-500" />
            Templates ({templates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => {
                  const TypeIcon = getTypeIcon(template.type);
                  return (
                    <TableRow key={template.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-gray-400" />
                          {getTypeBadge(template.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 max-w-xs truncate block">
                          {template.subject}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {template.variables?.slice(0, 2).map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables && template.variables.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {template.reminderSchedule?.enabled 
                              ? `${template.reminderSchedule.times?.length || 0} time${(template.reminderSchedule.times?.length || 0) !== 1 ? 's' : ''}`
                              : 'Disabled'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {template.send_count} sent
                        </div>
                        {template.last_sent && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(template.last_sent).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={template.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(template)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewMode(true)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}