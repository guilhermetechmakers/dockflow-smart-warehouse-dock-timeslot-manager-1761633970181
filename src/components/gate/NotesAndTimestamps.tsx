import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Clock, 
  Plus, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  User,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotesForm, GateEvent } from '@/types/gate';

const notesSchema = z.object({
  note: z.string().min(1, 'Note is required').max(500, 'Note is too long'),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.enum(['general', 'delay', 'issue', 'observation']),
});

interface NotesAndTimestampsProps {
  visitId: string;
  onAddNote: (data: NotesForm) => Promise<void>;
  events?: GateEvent[];
  className?: string;
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-gray-600 bg-gray-100' },
  medium: { label: 'Medium', color: 'text-yellow-700 bg-yellow-100' },
  high: { label: 'High', color: 'text-red-700 bg-red-100' },
};

const categoryConfig = {
  general: { label: 'General', icon: '📝' },
  delay: { label: 'Delay', icon: '⏰' },
  issue: { label: 'Issue', icon: '⚠️' },
  observation: { label: 'Observation', icon: '👁️' },
};

export function NotesAndTimestamps({ 
  onAddNote, 
  events = [], 
  className 
}: NotesAndTimestampsProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NotesForm>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      priority: 'medium',
      category: 'general',
    },
  });

  const onSubmit = async (data: NotesForm) => {
    try {
      setIsAddingNote(true);
      setError(null);
      setSuccess(null);
      
      await onAddNote(data);
      
      setSuccess('Note added successfully');
      reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMessage);
    } finally {
      setIsAddingNote(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'scanned':
        return '📱';
      case 'arrived':
        return '🚛';
      case 'waiting':
        return '⏳';
      case 'in_progress':
        return '⚡';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      case 'ramp_assigned':
        return '🏗️';
      case 'note_added':
        return '📝';
      case 'photo_captured':
        return '📷';
      case 'document_uploaded':
        return '📄';
      default:
        return '📋';
    }
  };

  const getEventLabel = (eventType: string) => {
    return eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes & Timeline
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Note Form */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Add Note
          </h4>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note" className="form-label">
                Note *
              </Label>
              <Textarea
                id="note"
                {...register('note')}
                placeholder="Enter your note here..."
                className={cn(
                  'form-input min-h-[100px] resize-none',
                  errors.note && 'border-red-500 focus:ring-red-500'
                )}
                rows={4}
              />
              {errors.note && (
                <p className="text-sm text-red-600">{errors.note.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority" className="form-label">
                  Priority
                </Label>
                <Select {...register('priority')}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', config.color)}>
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="form-label">
                  Category
                </Label>
                <Select {...register('category')}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isAddingNote}
              className="w-full btn-primary"
            >
              {isAddingNote ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Note...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Event Timeline
          </h4>
          
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No events recorded yet</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {sortedEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-all duration-200',
                      'hover:shadow-md hover:border-coral-200',
                      index === 0 && 'bg-coral-50 border-coral-200'
                    )}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-coral-100 rounded-full flex items-center justify-center text-sm">
                      {getEventIcon(event.event_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-gray-900">
                          {getEventLabel(event.event_type)}
                        </h5>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                      
                      {event.actor_name && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <User className="h-3 w-3" />
                          {event.actor_name}
                        </div>
                      )}
                      
                      {event.notes && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-2 border-coral-200">
                          {event.notes}
                        </p>
                      )}
                      
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="font-medium">{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Quick Note Templates */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Quick Notes
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { text: 'Driver arrived on time', category: 'general' as const },
              { text: 'Trailer in good condition', category: 'observation' as const },
              { text: 'Delayed due to traffic', category: 'delay' as const },
              { text: 'Special handling required', category: 'issue' as const },
            ].map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-auto p-2 text-left justify-start"
                onClick={() => {
                  reset({
                    note: template.text,
                    category: template.category,
                    priority: 'medium',
                  });
                }}
              >
                {template.text}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}