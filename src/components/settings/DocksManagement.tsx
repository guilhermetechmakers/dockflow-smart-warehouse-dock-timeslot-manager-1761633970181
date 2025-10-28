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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Save,
  X,
  Check,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const dockSchema = z.object({
  name: z.string().min(1, 'Dock name is required'),
  number: z.string().min(1, 'Dock number is required'),
  coordinates: z.object({
    x: z.number().min(0, 'X coordinate must be positive'),
    y: z.number().min(0, 'Y coordinate must be positive'),
  }).optional(),
  capabilities: z.array(z.string()).min(1, 'At least one capability is required'),
  isActive: z.boolean(),
});

type DockForm = z.infer<typeof dockSchema>;

interface Dock extends DockForm {
  id: string;
  created_at: string;
  updated_at: string;
}

const availableCapabilities = [
  'Standard Loading',
  'Refrigerated',
  'Hazmat',
  'Oversized',
  'Rail Access',
  'Crane Access',
  'Forklift Access',
  'Dock Leveler',
  'Sealable',
  'Temperature Controlled',
];

const mockDocks: Dock[] = [
  {
    id: '1',
    name: 'Main Dock A',
    number: 'A-01',
    coordinates: { x: 100, y: 200 },
    capabilities: ['Standard Loading', 'Dock Leveler', 'Forklift Access'],
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Refrigerated Dock B',
    number: 'B-02',
    coordinates: { x: 150, y: 250 },
    capabilities: ['Refrigerated', 'Temperature Controlled', 'Sealable'],
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    name: 'Hazmat Dock C',
    number: 'C-03',
    coordinates: { x: 200, y: 300 },
    capabilities: ['Hazmat', 'Oversized', 'Crane Access'],
    isActive: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

export function DocksManagement() {
  const [docks, setDocks] = useState<Dock[]>(mockDocks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDock, setEditingDock] = useState<Dock | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DockForm>({
    resolver: zodResolver(dockSchema),
    defaultValues: {
      name: '',
      number: '',
      coordinates: { x: 0, y: 0 },
      capabilities: [],
      isActive: true,
    },
  });

  const selectedCapabilities = watch('capabilities');

  const handleOpenDialog = (dock?: Dock) => {
    if (dock) {
      setEditingDock(dock);
      reset({
        name: dock.name,
        number: dock.number,
        coordinates: dock.coordinates || { x: 0, y: 0 },
        capabilities: dock.capabilities,
        isActive: dock.isActive,
      });
    } else {
      setEditingDock(null);
      reset({
        name: '',
        number: '',
        coordinates: { x: 0, y: 0 },
        capabilities: [],
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDock(null);
    reset();
  };

  const onSubmit = async (data: DockForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingDock) {
        // Update existing dock
        setDocks(prev => prev.map(dock => 
          dock.id === editingDock.id 
            ? { ...dock, ...data, updated_at: new Date().toISOString() }
            : dock
        ));
        toast.success('Dock updated successfully');
      } else {
        // Add new dock
        const newDock: Dock = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setDocks(prev => [...prev, newDock]);
        toast.success('Dock added successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save dock');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDock = async (dockId: string) => {
    if (window.confirm('Are you sure you want to delete this dock?')) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setDocks(prev => prev.filter(dock => dock.id !== dockId));
        toast.success('Dock deleted successfully');
      } catch (error) {
        toast.error('Failed to delete dock');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleActive = async (dockId: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setDocks(prev => prev.map(dock => 
        dock.id === dockId 
          ? { ...dock, isActive, updated_at: new Date().toISOString() }
          : dock
      ));
      toast.success(`Dock ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update dock status');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCapability = (capability: string) => {
    const currentCapabilities = selectedCapabilities || [];
    const newCapabilities = currentCapabilities.includes(capability)
      ? currentCapabilities.filter(c => c !== capability)
      : [...currentCapabilities, capability];
    setValue('capabilities', newCapabilities, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
            <Truck className="h-6 w-6 text-coral-500" />
            Docks Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage dock locations, capabilities, and operational status
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Dock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDock ? 'Edit Dock' : 'Add New Dock'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="form-label">
                    Dock Name *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className="form-input"
                    placeholder="e.g., Main Dock A"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="number" className="form-label">
                    Dock Number *
                  </Label>
                  <Input
                    id="number"
                    {...register('number')}
                    className="form-input"
                    placeholder="e.g., A-01"
                  />
                  {errors.number && (
                    <p className="text-red-500 text-sm mt-1">{errors.number.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coordinates.x" className="form-label">
                    X Coordinate
                  </Label>
                  <Input
                    id="coordinates.x"
                    type="number"
                    {...register('coordinates.x', { valueAsNumber: true })}
                    className="form-input"
                    placeholder="0"
                  />
                  {errors.coordinates?.x && (
                    <p className="text-red-500 text-sm mt-1">{errors.coordinates.x.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="coordinates.y" className="form-label">
                    Y Coordinate
                  </Label>
                  <Input
                    id="coordinates.y"
                    type="number"
                    {...register('coordinates.y', { valueAsNumber: true })}
                    className="form-input"
                    placeholder="0"
                  />
                  {errors.coordinates?.y && (
                    <p className="text-red-500 text-sm mt-1">{errors.coordinates.y.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="form-label">Capabilities *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableCapabilities.map((capability) => (
                    <div
                      key={capability}
                      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedCapabilities?.includes(capability)
                          ? 'bg-coral-50 border-coral-200 text-coral-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleCapability(capability)}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedCapabilities?.includes(capability)
                          ? 'bg-coral-500 border-coral-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedCapabilities?.includes(capability) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{capability}</span>
                    </div>
                  ))}
                </div>
                {errors.capabilities && (
                  <p className="text-red-500 text-sm mt-1">{errors.capabilities.message}</p>
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
                  {isLoading ? 'Saving...' : editingDock ? 'Update Dock' : 'Add Dock'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Docks Table */}
      <Card className="dockflow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-coral-500" />
            Docks List ({docks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docks.map((dock) => (
                  <TableRow key={dock.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{dock.name}</TableCell>
                    <TableCell>{dock.number}</TableCell>
                    <TableCell>
                      {dock.coordinates ? (
                        <span className="text-sm text-gray-600">
                          ({dock.coordinates.x}, {dock.coordinates.y})
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dock.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={dock.isActive}
                          onCheckedChange={(checked) => handleToggleActive(dock.id, checked)}
                          disabled={isLoading}
                        />
                        <span className={`text-sm ${
                          dock.isActive ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {dock.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(dock)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDock(dock.id)}
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