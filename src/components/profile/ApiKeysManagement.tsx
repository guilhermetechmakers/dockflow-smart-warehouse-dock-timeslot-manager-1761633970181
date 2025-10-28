import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Calendar } from 'lucide-react';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/hooks/useProfile';
import { apiKeyCreateSchema, type ApiKeyCreateInput } from '@/lib/validations';

export function ApiKeysManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState<string | null>(null);
  
  const { data: apiKeys, isLoading } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApiKeyCreateInput>({
    resolver: zodResolver(apiKeyCreateSchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  });

  const onSubmit = async (data: ApiKeyCreateInput) => {
    try {
      const result = await createApiKey.mutateAsync(data);
      setNewKey(result.key);
      setIsCreateOpen(false);
      reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      try {
        await revokeApiKey.mutateAsync(keyId);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const availablePermissions = [
    { id: 'read_bookings', label: 'Read Bookings', description: 'View booking information' },
    { id: 'write_bookings', label: 'Write Bookings', description: 'Create and update bookings' },
    { id: 'read_visits', label: 'Read Visits', description: 'View visit information' },
    { id: 'write_visits', label: 'Write Visits', description: 'Update visit status' },
    { id: 'read_warehouses', label: 'Read Warehouses', description: 'View warehouse information' },
    { id: 'admin', label: 'Admin Access', description: 'Full administrative access' },
  ];

  if (isLoading) {
    return (
      <Card className="dockflow-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="dockflow-card dockflow-card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-coral-500" />
              <CardTitle>API Keys</CardTitle>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="form-label">
                      Key Name
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      className="form-input"
                      placeholder="Enter a name for this API key"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="form-label">Permissions</Label>
                    <div className="space-y-2">
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={permission.id}
                            value={permission.id}
                            {...register('permissions')}
                          />
                          <div className="flex-1">
                            <Label htmlFor={permission.id} className="text-sm font-medium">
                              {permission.label}
                            </Label>
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.permissions && (
                      <p className="text-sm text-red-600">{errors.permissions.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      disabled={isSubmitting}
                      className="btn-outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Key'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            API keys allow external applications to access your DockFlow data. Keep them secure and only share with trusted applications.
          </p>
        </CardContent>
      </Card>

      {/* New Key Display */}
      {newKey && (
        <Card className="dockflow-card border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-900">New API Key Created</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-900">Your API Key:</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newKey}
                    readOnly
                    className="form-input bg-white font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newKey)}
                    className="btn-outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-green-700">
                  ⚠️ This is the only time you'll see this key. Copy it now and store it securely.
                </p>
              </div>
              <Button
                onClick={() => setNewKey(null)}
                className="btn-primary"
                size="sm"
              >
                I've Saved It
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card className="dockflow-card dockflow-card-hover">
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys && apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{key.name}</h4>
                        <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                          {key.status}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          Key: {key.key_prefix}...
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="ml-2 p-0 h-auto text-xs"
                          >
                            {showKeys[key.id] ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Show
                              </>
                            )}
                          </Button>
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                          </div>
                          {key.last_used && (
                            <div>
                              Last used: {new Date(key.last_used).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {key.permissions.map((permission: string) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevoke(key.id)}
                      disabled={revokeApiKey.isPending}
                      className="btn-outline text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
              <p className="text-gray-600 mb-4">Create your first API key to start integrating with external applications.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
