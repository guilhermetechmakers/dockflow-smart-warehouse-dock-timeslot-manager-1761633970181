import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Plus,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { VisitHeader } from '@/components/visit-detail/VisitHeader';
import { VisitTimeline } from '@/components/visit-detail/VisitTimeline';
import { VisitFiles } from '@/components/visit-detail/VisitFiles';
import { DelayAnalysis } from '@/components/visit-detail/DelayAnalysis';
import { FileUploadModal } from '@/components/visit-detail/FileUploadModal';
import { DisputeClaimDialog } from '@/components/visit-detail/DisputeClaimDialog';
import { 
  useVisitDetail, 
  useCauseCodes, 
  useUpdateVisitStatus,
  useAssignRamp,
  useAddVisitNote,
  useUploadVisitFile,
  useDeleteVisitFile,
  useCreateDispute,
  useExportVisit
} from '@/hooks/useVisitDetail';
import type { CreateDisputeInput } from '@/types/visit-detail';

const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  is_internal: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

export function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  // Fetch visit data
  const { 
    data: visit, 
    isLoading: visitLoading, 
    error: visitError 
  } = useVisitDetail(id!, {
    include_notes: true,
    include_files: true,
    include_disputes: true,
    include_delay_analysis: true,
  });

  const { data: causeCodes = [] } = useCauseCodes(visit?.warehouse_id);

  // Mutations
  const updateStatusMutation = useUpdateVisitStatus();
  const assignRampMutation = useAssignRamp();
  const addNoteMutation = useAddVisitNote();
  const uploadFileMutation = useUploadVisitFile();
  const deleteFileMutation = useDeleteVisitFile();
  const createDisputeMutation = useCreateDispute();
  const exportVisitMutation = useExportVisit();

  // Note form
  const noteForm = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: '',
      is_internal: false,
      tags: [],
    }
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    
    try {
      await updateStatusMutation.mutateAsync({ visitId: id, status });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRampAssign = async (ramp: string) => {
    if (!id) return;
    
    try {
      await assignRampMutation.mutateAsync({ visitId: id, ramp });
    } catch (error) {
      console.error('Failed to assign ramp:', error);
    }
  };

  const handleFileUpload = async (file: File, metadata?: { description?: string; tags?: string[] }) => {
    if (!id) return;
    
    try {
      await uploadFileMutation.mutateAsync({ visitId: id, file, metadata });
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!id) return;
    
    try {
      await deleteFileMutation.mutateAsync({ visitId: id, fileId });
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleAddNote = async (data: NoteFormData) => {
    if (!id) return;
    
    try {
      await addNoteMutation.mutateAsync({ visitId: id, note: data });
      noteForm.reset();
      setShowAddNote(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleCreateDispute = async (dispute: CreateDisputeInput) => {
    if (!id) return;
    
    try {
      await createDisputeMutation.mutateAsync({ visitId: id, dispute });
      setShowDisputeDialog(false);
    } catch (error) {
      console.error('Failed to create dispute:', error);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    
    try {
      await exportVisitMutation.mutateAsync({ 
        visitId: id, 
        format: 'pdf',
        options: {
          include_files: true,
          include_notes: true,
          include_timeline: true,
          include_disputes: true
        }
      });
    } catch (error) {
      console.error('Failed to export visit:', error);
    }
  };

  if (visitLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (visitError || !visit) {
    return (
      <div className="p-6">
        <Card className="dockflow-card">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Visit Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The visit you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Visit Header */}
      <VisitHeader
        visit={visit}
        onBack={handleBack}
        onExport={handleExport}
        onStatusChange={handleStatusChange}
        onRampAssign={handleRampAssign}
        canEdit={true}
        canExport={true}
        canChangeStatus={true}
        canAssignRamp={true}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <VisitTimeline
              events={visit.timeline}
              canAddEvents={true}
            />

            {/* Files */}
            <VisitFiles
              files={visit.files}
              onUpload={handleFileUpload}
              onDelete={handleFileDelete}
              canUpload={true}
              canDelete={true}
            />
          </div>

          {/* Notes Section */}
          <Card className="dockflow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-coral-500" />
                  Notes
                </CardTitle>
                <Button
                  onClick={() => setShowAddNote(true)}
                  size="sm"
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {visit.notes && visit.notes.length > 0 ? (
                <div className="space-y-4">
                  {visit.notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{note.created_by_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {note.is_internal ? 'Internal' : 'External'}
                          </Badge>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-1">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No notes yet</p>
                  <Button
                    onClick={() => setShowAddNote(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Note
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disputes Section */}
          {visit.disputes && visit.disputes.length > 0 && (
            <Card className="dockflow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Disputes ({visit.disputes.length})
                  </CardTitle>
                  <Button
                    onClick={() => setShowDisputeDialog(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Dispute
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visit.disputes.map((dispute) => (
                    <div key={dispute.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{dispute.reason}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              dispute.status === 'open' ? 'border-red-200 text-red-700' :
                              dispute.status === 'in_review' ? 'border-yellow-200 text-yellow-700' :
                              dispute.status === 'resolved' ? 'border-green-200 text-green-700' :
                              'border-gray-200 text-gray-700'
                            }`}
                          >
                            {dispute.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(dispute.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{dispute.description}</p>
                      {dispute.amount_disputed && (
                        <p className="text-sm text-gray-600">
                          Amount: {dispute.currency} {dispute.amount_disputed.toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <VisitTimeline
            events={visit.timeline}
            canAddEvents={true}
          />
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <VisitFiles
            files={visit.files}
            onUpload={handleFileUpload}
            onDelete={handleFileDelete}
            canUpload={true}
            canDelete={true}
          />
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <DelayAnalysis
            delayAnalysis={visit.delay_analysis}
            causeCodes={causeCodes}
            canEdit={true}
          />
        </TabsContent>
      </Tabs>

      {/* Add Note Modal */}
      {showAddNote && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="dockflow-card w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={noteForm.handleSubmit(handleAddNote)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Note Content *</Label>
                  <Textarea
                    {...noteForm.register('content')}
                    placeholder="Enter your note..."
                    className="min-h-[100px]"
                  />
                  {noteForm.formState.errors.content && (
                    <p className="text-sm text-red-600">
                      {noteForm.formState.errors.content.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_internal"
                    {...noteForm.register('is_internal')}
                    className="rounded"
                  />
                  <Label htmlFor="is_internal" className="text-sm">
                    Internal note (not visible to carriers)
                  </Label>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddNote(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={noteForm.formState.isSubmitting}
                    className="btn-primary"
                  >
                    {noteForm.formState.isSubmitting ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Card>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUploadModal
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
          onUpload={handleFileUpload}
        />
      )}

      {/* Dispute Claim Dialog */}
      {showDisputeDialog && (
        <DisputeClaimDialog
          isOpen={showDisputeDialog}
          onClose={() => setShowDisputeDialog(false)}
          onSubmit={handleCreateDispute}
          isLoading={createDisputeMutation.isPending}
          availableFiles={visit.files}
        />
      )}
    </div>
  );
}
