import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Plus
} from 'lucide-react';
import type { CreateDisputeInput } from '@/types/visit-detail';

const disputeSchema = z.object({
  dispute_type: z.enum(['billing', 'service', 'delay', 'damage', 'other']),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  amount_disputed: z.number().min(0).optional(),
  currency: z.string().optional(),
  supporting_files: z.array(z.string()).optional(),
});

type DisputeFormData = z.infer<typeof disputeSchema>;

interface DisputeClaimDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dispute: CreateDisputeInput) => void;
  isLoading?: boolean;
  availableFiles?: Array<{ id: string; filename: string; file_type: string }>;
}

const disputeTypes = [
  { value: 'billing', label: 'Billing Dispute', description: 'Issues with charges or invoicing' },
  { value: 'service', label: 'Service Quality', description: 'Problems with service delivery' },
  { value: 'delay', label: 'Delay Issues', description: 'Disputes related to delays' },
  { value: 'damage', label: 'Damage Claims', description: 'Claims for damaged goods or equipment' },
  { value: 'other', label: 'Other', description: 'Other types of disputes' },
];

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

export function DisputeClaimDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  availableFiles = []
}: DisputeClaimDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      dispute_type: 'billing',
      currency: 'USD',
      supporting_files: [],
    }
  });

  const disputeType = watch('dispute_type');
  const showAmountField = ['billing', 'damage'].includes(disputeType);

  const handleFileToggle = (fileId: string) => {
    setSelectedFiles(prev => {
      const newFiles = prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId];
      
      setValue('supporting_files', newFiles);
      return newFiles;
    });
  };

  const handleCustomReasonAdd = () => {
    if (customReason.trim()) {
      setValue('reason', customReason.trim());
      setCustomReason('');
    }
  };

  const handleSubmitForm = (data: DisputeFormData) => {
    const dispute: CreateDisputeInput = {
      dispute_type: data.dispute_type,
      reason: data.reason,
      description: data.description,
      amount_disputed: data.amount_disputed,
      currency: data.currency,
      supporting_files: data.supporting_files,
    };
    
    onSubmit(dispute);
  };

  const handleClose = () => {
    reset();
    setSelectedFiles([]);
    setCustomReason('');
    onClose();
  };

  const selectedDisputeType = disputeTypes.find(type => type.value === disputeType);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Create Dispute Claim
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          {/* Dispute Type */}
          <div className="space-y-2">
            <Label htmlFor="dispute_type">Dispute Type *</Label>
            <Select
              value={disputeType}
              onValueChange={(value) => setValue('dispute_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dispute type" />
              </SelectTrigger>
              <SelectContent>
                {disputeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dispute_type && (
              <p className="text-sm text-red-600">{errors.dispute_type.message}</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <div className="flex gap-2">
              <Input
                {...register('reason')}
                placeholder="Enter dispute reason"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCustomReasonAdd}
                disabled={!customReason.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              {...register('description')}
              placeholder="Provide detailed description of the dispute..."
              className="min-h-[100px]"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Amount (conditional) */}
          {showAmountField && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount_disputed">Amount Disputed</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('amount_disputed', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
                {errors.amount_disputed && (
                  <p className="text-sm text-red-600">{errors.amount_disputed.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Supporting Files */}
          {availableFiles.length > 0 && (
            <div className="space-y-3">
              <Label>Supporting Files (optional)</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`file-${file.id}`}
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => handleFileToggle(file.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {file.filename}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {file.file_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Select files that support your dispute claim
              </p>
            </div>
          )}

          {/* Dispute Type Info */}
          {selectedDisputeType && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    {selectedDisputeType.label}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedDisputeType.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Create Dispute
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}