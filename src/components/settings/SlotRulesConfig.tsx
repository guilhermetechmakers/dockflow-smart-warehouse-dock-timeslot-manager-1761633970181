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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users,
  Save,
  X,
  Check,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const slotRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  dockId: z.string().optional(),
  durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  bufferMinutes: z.number().min(0, 'Buffer cannot be negative'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  overbookingPolicy: z.enum(['none', 'limited', 'unlimited']),
  allowedCargoTypes: z.array(z.string()).min(1, 'At least one cargo type is required'),
  isActive: z.boolean(),
});

type SlotRuleForm = z.infer<typeof slotRuleSchema>;

interface SlotRule extends SlotRuleForm {
  id: string;
  created_at: string;
  updated_at: string;
}

const overbookingPolicies = [
  { value: 'none', label: 'No Overbooking', description: 'Strict capacity limits' },
  { value: 'limited', label: 'Limited Overbooking', description: 'Allow 10% over capacity' },
  { value: 'unlimited', label: 'Unlimited Overbooking', description: 'No capacity restrictions' },
];

const cargoTypes = [
  'General Freight',
  'Refrigerated',
  'Hazmat Class 1',
  'Hazmat Class 2',
  'Hazmat Class 3',
  'Hazmat Class 4',
  'Hazmat Class 5',
  'Hazmat Class 6',
  'Hazmat Class 7',
  'Hazmat Class 8',
  'Hazmat Class 9',
  'Oversized',
  'Fragile',
  'High Value',
  'Temperature Sensitive',
  'Food Grade',
  'Pharmaceutical',
  'Electronics',
  'Automotive',
  'Construction Materials',
];

const mockDocks = [
  { id: '1', name: 'Main Dock A', number: 'A-01' },
  { id: '2', name: 'Refrigerated Dock B', number: 'B-02' },
  { id: '3', name: 'Hazmat Dock C', number: 'C-03' },
];

const mockSlotRules: SlotRule[] = [
  {
    id: '1',
    name: 'Standard Loading Rule',
    dockId: '1',
    durationMinutes: 60,
    bufferMinutes: 15,
    capacity: 1,
    overbookingPolicy: 'none',
    allowedCargoTypes: ['General Freight', 'Fragile', 'High Value'],
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Refrigerated Cargo Rule',
    dockId: '2',
    durationMinutes: 90,
    bufferMinutes: 30,
    capacity: 1,
    overbookingPolicy: 'limited',
    allowedCargoTypes: ['Refrigerated', 'Temperature Sensitive', 'Food Grade', 'Pharmaceutical'],
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    name: 'Hazmat Loading Rule',
    dockId: '3',
    durationMinutes: 120,
    bufferMinutes: 45,
    capacity: 1,
    overbookingPolicy: 'none',
    allowedCargoTypes: ['Hazmat Class 1', 'Hazmat Class 2', 'Hazmat Class 3', 'Hazmat Class 4'],
    isActive: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

export function SlotRulesConfig() {
  const [slotRules, setSlotRules] = useState<SlotRule[]>(mockSlotRules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SlotRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SlotRuleForm>({
    resolver: zodResolver(slotRuleSchema),
    defaultValues: {
      name: '',
      dockId: '',
      durationMinutes: 60,
      bufferMinutes: 15,
      capacity: 1,
      overbookingPolicy: 'none',
      allowedCargoTypes: [],
      isActive: true,
    },
  });

  const selectedCargoTypes = watch('allowedCargoTypes');

  const handleOpenDialog = (rule?: SlotRule) => {
    if (rule) {
      setEditingRule(rule);
      reset({
        name: rule.name,
        dockId: rule.dockId || '',
        durationMinutes: rule.durationMinutes,
        bufferMinutes: rule.bufferMinutes,
        capacity: rule.capacity,
        overbookingPolicy: rule.overbookingPolicy,
        allowedCargoTypes: rule.allowedCargoTypes,
        isActive: rule.isActive,
      });
    } else {
      setEditingRule(null);
      reset({
        name: '',
        dockId: '',
        durationMinutes: 60,
        bufferMinutes: 15,
        capacity: 1,
        overbookingPolicy: 'none',
        allowedCargoTypes: [],
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    reset();
  };

  const onSubmit = async (data: SlotRuleForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingRule) {
        // Update existing rule
        setSlotRules(prev => prev.map(rule => 
          rule.id === editingRule.id 
            ? { ...rule, ...data, updated_at: new Date().toISOString() }
            : rule
        ));
        toast.success('Slot rule updated successfully');
      } else {
        // Add new rule
        const newRule: SlotRule = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setSlotRules(prev => [...prev, newRule]);
        toast.success('Slot rule added successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save slot rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this slot rule?')) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setSlotRules(prev => prev.filter(rule => rule.id !== ruleId));
        toast.success('Slot rule deleted successfully');
      } catch (error) {
        toast.error('Failed to delete slot rule');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleActive = async (ruleId: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSlotRules(prev => prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive, updated_at: new Date().toISOString() }
          : rule
      ));
      toast.success(`Slot rule ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update slot rule status');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCargoType = (cargoType: string) => {
    const currentTypes = selectedCargoTypes || [];
    const newTypes = currentTypes.includes(cargoType)
      ? currentTypes.filter(t => t !== cargoType)
      : [...currentTypes, cargoType];
    setValue('allowedCargoTypes', newTypes, { shouldDirty: true });
  };

  const getDockName = (dockId: string) => {
    const dock = mockDocks.find(d => d.id === dockId);
    return dock ? `${dock.name} (${dock.number})` : 'All Docks';
  };

  const getOverbookingLabel = (policy: string) => {
    const policyObj = overbookingPolicies.find(p => p.value === policy);
    return policyObj ? policyObj.label : policy;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
            <Settings className="h-6 w-6 text-coral-500" />
            Slot Rules Configuration
          </h2>
          <p className="text-gray-600 mt-1">
            Define booking rules, capacity limits, and cargo type restrictions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Slot Rule' : 'Add New Slot Rule'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="form-label">
                    Rule Name *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className="form-input"
                    placeholder="e.g., Standard Loading Rule"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dockId" className="form-label">
                    Apply to Dock
                  </Label>
                  <Select
                    value={watch('dockId')}
                    onValueChange={(value) => setValue('dockId', value, { shouldDirty: true })}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select dock (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Docks</SelectItem>
                      {mockDocks.map((dock) => (
                        <SelectItem key={dock.id} value={dock.id}>
                          {dock.name} ({dock.number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="durationMinutes" className="form-label">
                    Duration (minutes) *
                  </Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    {...register('durationMinutes', { valueAsNumber: true })}
                    className="form-input"
                    placeholder="60"
                    min="15"
                  />
                  {errors.durationMinutes && (
                    <p className="text-red-500 text-sm mt-1">{errors.durationMinutes.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bufferMinutes" className="form-label">
                    Buffer (minutes) *
                  </Label>
                  <Input
                    id="bufferMinutes"
                    type="number"
                    {...register('bufferMinutes', { valueAsNumber: true })}
                    className="form-input"
                    placeholder="15"
                    min="0"
                  />
                  {errors.bufferMinutes && (
                    <p className="text-red-500 text-sm mt-1">{errors.bufferMinutes.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="capacity" className="form-label">
                    Capacity *
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
                    className="form-input"
                    placeholder="1"
                    min="1"
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="overbookingPolicy" className="form-label">
                  Overbooking Policy *
                </Label>
                <Select
                  value={watch('overbookingPolicy')}
                  onValueChange={(value: 'none' | 'limited' | 'unlimited') => 
                    setValue('overbookingPolicy', value, { shouldDirty: true })
                  }
                >
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Select overbooking policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {overbookingPolicies.map((policy) => (
                      <SelectItem key={policy.value} value={policy.value}>
                        <div>
                          <div className="font-medium">{policy.label}</div>
                          <div className="text-sm text-gray-500">{policy.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.overbookingPolicy && (
                  <p className="text-red-500 text-sm mt-1">{errors.overbookingPolicy.message}</p>
                )}
              </div>

              <div>
                <Label className="form-label">Allowed Cargo Types *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
                  {cargoTypes.map((cargoType) => (
                    <div
                      key={cargoType}
                      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedCargoTypes?.includes(cargoType)
                          ? 'bg-coral-50 border-coral-200 text-coral-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleCargoType(cargoType)}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedCargoTypes?.includes(cargoType)
                          ? 'bg-coral-500 border-coral-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedCargoTypes?.includes(cargoType) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{cargoType}</span>
                    </div>
                  ))}
                </div>
                {errors.allowedCargoTypes && (
                  <p className="text-red-500 text-sm mt-1">{errors.allowedCargoTypes.message}</p>
                )}
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
                  {isLoading ? 'Saving...' : editingRule ? 'Update Rule' : 'Add Rule'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Slot Rules Table */}
      <Card className="dockflow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-coral-500" />
            Slot Rules ({slotRules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Dock</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Buffer</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Overbooking</TableHead>
                  <TableHead>Cargo Types</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slotRules.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {rule.dockId ? getDockName(rule.dockId) : 'All Docks'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{rule.durationMinutes}m</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{rule.bufferMinutes}m</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{rule.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={rule.overbookingPolicy === 'none' ? 'secondary' : 
                                rule.overbookingPolicy === 'limited' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {getOverbookingLabel(rule.overbookingPolicy)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {rule.allowedCargoTypes.slice(0, 2).map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {rule.allowedCargoTypes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{rule.allowedCargoTypes.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => handleToggleActive(rule.id, checked)}
                          disabled={isLoading}
                        />
                        <span className={`text-sm ${
                          rule.isActive ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(rule)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}