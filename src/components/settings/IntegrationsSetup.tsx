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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plug, 
  Key, 
  Webhook, 
  Shield, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  TestTube,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const webhookSchema = z.object({
  name: z.string().min(1, 'Webhook name is required'),
  url: z.string().url('Invalid URL'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  secret: z.string().optional(),
  isActive: z.boolean(),
});

const apiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

const ssoSchema = z.object({
  provider: z.enum(['okta', 'azure', 'google', 'saml']),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  domain: z.string().min(1, 'Domain is required'),
  isActive: z.boolean(),
});

type WebhookForm = z.infer<typeof webhookSchema>;
type ApiKeyForm = z.infer<typeof apiKeySchema>;
type SSOForm = z.infer<typeof ssoSchema>;

interface Webhook extends WebhookForm {
  id: string;
  created_at: string;
  updated_at: string;
  last_triggered?: string;
  status: 'active' | 'inactive' | 'error';
}

interface ApiKey extends ApiKeyForm {
  id: string;
  key: string;
  created_at: string;
  updated_at: string;
  last_used?: string;
}

interface SSOConfig extends SSOForm {
  id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'error';
}

const webhookEvents = [
  { id: 'booking.created', name: 'Booking Created', description: 'When a new booking is created' },
  { id: 'booking.updated', name: 'Booking Updated', description: 'When a booking is modified' },
  { id: 'booking.cancelled', name: 'Booking Cancelled', description: 'When a booking is cancelled' },
  { id: 'visit.arrived', name: 'Visit Arrived', description: 'When a driver arrives at the gate' },
  { id: 'visit.started', name: 'Visit Started', description: 'When loading/unloading begins' },
  { id: 'visit.completed', name: 'Visit Completed', description: 'When a visit is finished' },
  { id: 'dock.assigned', name: 'Dock Assigned', description: 'When a dock is assigned to a visit' },
  { id: 'user.created', name: 'User Created', description: 'When a new user is created' },
  { id: 'user.updated', name: 'User Updated', description: 'When a user is modified' },
];

const apiPermissions = [
  { id: 'read:bookings', name: 'Read Bookings', description: 'View booking information' },
  { id: 'write:bookings', name: 'Write Bookings', description: 'Create and modify bookings' },
  { id: 'read:visits', name: 'Read Visits', description: 'View visit information' },
  { id: 'write:visits', name: 'Write Visits', description: 'Update visit status' },
  { id: 'read:docks', name: 'Read Docks', description: 'View dock information' },
  { id: 'write:docks', name: 'Write Docks', description: 'Modify dock settings' },
  { id: 'read:analytics', name: 'Read Analytics', description: 'Access analytics data' },
  { id: 'admin:all', name: 'Admin All', description: 'Full administrative access' },
];

const ssoProviders = [
  { id: 'okta', name: 'Okta', description: 'Okta SSO integration' },
  { id: 'azure', name: 'Azure AD', description: 'Microsoft Azure Active Directory' },
  { id: 'google', name: 'Google Workspace', description: 'Google Workspace SSO' },
  { id: 'saml', name: 'SAML', description: 'Generic SAML provider' },
];

const mockWebhooks: Webhook[] = [
  {
    id: '1',
    name: 'TMS Integration',
    url: 'https://tms.company.com/webhooks/dockflow',
    events: ['booking.created', 'visit.arrived', 'visit.completed'],
    secret: 'whsec_1234567890abcdef',
    isActive: true,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_triggered: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'WMS Integration',
    url: 'https://wms.company.com/api/dockflow',
    events: ['dock.assigned', 'visit.started'],
    secret: 'whsec_abcdef1234567890',
    isActive: false,
    status: 'error',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Mobile App Key',
    key: 'df_live_1234567890abcdef',
    permissions: ['read:bookings', 'write:visits'],
    expiresAt: '2024-12-31',
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_used: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'TMS Integration Key',
    key: 'df_live_abcdef1234567890',
    permissions: ['read:bookings', 'write:bookings', 'read:visits'],
    expiresAt: '2025-01-01',
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_used: '2024-01-20T09:15:00Z',
  },
];

const mockSSOConfigs: SSOConfig[] = [
  {
    id: '1',
    provider: 'okta',
    clientId: '0oa1234567890abcdef',
    clientSecret: 'secret_1234567890abcdef',
    domain: 'company.okta.com',
    isActive: true,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

export function IntegrationsSetup() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [ssoConfigs, setSsoConfigs] = useState<SSOConfig[]>(mockSSOConfigs);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('webhooks');

  const webhookForm = useForm<WebhookForm>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: '',
      url: '',
      events: [],
      secret: '',
      isActive: true,
    },
  });

  const apiKeyForm = useForm<ApiKeyForm>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: '',
      permissions: [],
      expiresAt: '',
      isActive: true,
    },
  });

  const ssoForm = useForm<SSOForm>({
    resolver: zodResolver(ssoSchema),
    defaultValues: {
      provider: 'okta',
      clientId: '',
      clientSecret: '',
      domain: '',
      isActive: true,
    },
  });

  const selectedWebhookEvents = webhookForm.watch('events');
  const selectedApiPermissions = apiKeyForm.watch('permissions');

  const toggleWebhookEvent = (eventId: string) => {
    const currentEvents = selectedWebhookEvents || [];
    const newEvents = currentEvents.includes(eventId)
      ? currentEvents.filter(e => e !== eventId)
      : [...currentEvents, eventId];
    webhookForm.setValue('events', newEvents, { shouldDirty: true });
  };

  const toggleApiPermission = (permissionId: string) => {
    const currentPermissions = selectedApiPermissions || [];
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];
    apiKeyForm.setValue('permissions', newPermissions, { shouldDirty: true });
  };

  const generateApiKey = () => {
    const key = `df_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    return key;
  };

  const onWebhookSubmit = async (data: WebhookForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newWebhook: Webhook = {
        id: Date.now().toString(),
        ...data,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setWebhooks(prev => [...prev, newWebhook]);
      toast.success('Webhook created successfully');
      webhookForm.reset();
    } catch (error) {
      toast.error('Failed to create webhook');
    } finally {
      setIsLoading(false);
    }
  };

  const onApiKeySubmit = async (data: ApiKeyForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        ...data,
        key: generateApiKey(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setApiKeys(prev => [...prev, newApiKey]);
      toast.success('API key created successfully');
      apiKeyForm.reset();
    } catch (error) {
      toast.error('Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  const onSSOSubmit = async (data: SSOForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSSO: SSOConfig = {
        id: Date.now().toString(),
        ...data,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSsoConfigs(prev => [...prev, newSSO]);
      toast.success('SSO configuration created successfully');
      ssoForm.reset();
    } catch (error) {
      toast.error('Failed to create SSO configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
        toast.success('Webhook deleted successfully');
      } catch (error) {
        toast.error('Failed to delete webhook');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        toast.success('API key deleted successfully');
      } catch (error) {
        toast.error('Failed to delete API key');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteSSO = async (ssoId: string) => {
    if (window.confirm('Are you sure you want to delete this SSO configuration?')) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSsoConfigs(prev => prev.filter(sso => sso.id !== ssoId));
        toast.success('SSO configuration deleted successfully');
      } catch (error) {
        toast.error('Failed to delete SSO configuration');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="text-xs">Active</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
            <Plug className="h-6 w-6 text-coral-500" />
            Integrations Setup
          </h2>
          <p className="text-gray-600 mt-1">
            Configure webhooks, API keys, and SSO integrations
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhooks">Webhooks ({webhooks.length})</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys ({apiKeys.length})</TabsTrigger>
          <TabsTrigger value="sso">SSO ({ssoConfigs.length})</TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-coral-500" />
                Webhook Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="webhookName" className="form-label">
                      Webhook Name *
                    </Label>
                    <Input
                      id="webhookName"
                      {...webhookForm.register('name')}
                      className="form-input"
                      placeholder="e.g., TMS Integration"
                    />
                    {webhookForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {webhookForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="webhookUrl" className="form-label">
                      Webhook URL *
                    </Label>
                    <Input
                      id="webhookUrl"
                      {...webhookForm.register('url')}
                      className="form-input"
                      placeholder="https://example.com/webhook"
                    />
                    {webhookForm.formState.errors.url && (
                      <p className="text-red-500 text-sm mt-1">
                        {webhookForm.formState.errors.url.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="form-label">Events to Subscribe To *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {webhookEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedWebhookEvents?.includes(event.id)
                            ? 'bg-coral-50 border-coral-200 text-coral-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => toggleWebhookEvent(event.id)}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedWebhookEvents?.includes(event.id)
                            ? 'bg-coral-500 border-coral-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedWebhookEvents?.includes(event.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{event.name}</div>
                          <div className="text-xs text-gray-500">{event.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {webhookForm.formState.errors.events && (
                    <p className="text-red-500 text-sm mt-1">
                      {webhookForm.formState.errors.events.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="webhookSecret" className="form-label">
                    Webhook Secret
                  </Label>
                  <Input
                    id="webhookSecret"
                    {...webhookForm.register('secret')}
                    className="form-input"
                    placeholder="whsec_1234567890abcdef"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional secret for webhook signature verification
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={webhookForm.watch('isActive')}
                    onCheckedChange={(checked) => webhookForm.setValue('isActive', checked, { shouldDirty: true })}
                  />
                  <Label className="text-sm font-medium">
                    Active
                  </Label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => webhookForm.reset()}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !webhookForm.formState.isDirty}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Webhook className="h-4 w-4" />
                    )}
                    {isLoading ? 'Creating...' : 'Create Webhook'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing Webhooks */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle>Existing Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(webhook.status)}
                        <div>
                          <h4 className="font-medium">{webhook.name}</h4>
                          <p className="text-sm text-gray-600">{webhook.url}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(webhook.status)}
                            <span className="text-xs text-gray-500">
                              {webhook.events.length} event{webhook.events.length !== 1 ? 's' : ''}
                            </span>
                            {webhook.last_triggered && (
                              <span className="text-xs text-gray-500">
                                Last triggered: {new Date(webhook.last_triggered).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.url)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-coral-500" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="apiKeyName" className="form-label">
                    API Key Name *
                  </Label>
                  <Input
                    id="apiKeyName"
                    {...apiKeyForm.register('name')}
                    className="form-input"
                    placeholder="e.g., Mobile App Key"
                  />
                  {apiKeyForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {apiKeyForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="form-label">Permissions *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {apiPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedApiPermissions?.includes(permission.id)
                            ? 'bg-coral-50 border-coral-200 text-coral-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => toggleApiPermission(permission.id)}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedApiPermissions?.includes(permission.id)
                            ? 'bg-coral-500 border-coral-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedApiPermissions?.includes(permission.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{permission.name}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {apiKeyForm.formState.errors.permissions && (
                    <p className="text-red-500 text-sm mt-1">
                      {apiKeyForm.formState.errors.permissions.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expiresAt" className="form-label">
                    Expires At
                  </Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    {...apiKeyForm.register('expiresAt')}
                    className="form-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty for no expiration
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={apiKeyForm.watch('isActive')}
                    onCheckedChange={(checked) => apiKeyForm.setValue('isActive', checked, { shouldDirty: true })}
                  />
                  <Label className="text-sm font-medium">
                    Active
                  </Label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => apiKeyForm.reset()}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !apiKeyForm.formState.isDirty}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    {isLoading ? 'Creating...' : 'Create API Key'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing API Keys */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle>Existing API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {apiKey.key}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {apiKey.permissions.length} permission{apiKey.permissions.length !== 1 ? 's' : ''}
                          </Badge>
                          {apiKey.expiresAt && (
                            <span className="text-xs text-gray-500">
                              Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                          {apiKey.last_used && (
                            <span className="text-xs text-gray-500">
                              Last used: {new Date(apiKey.last_used).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSO Tab */}
        <TabsContent value="sso" className="space-y-6">
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-coral-500" />
                Single Sign-On (SSO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={ssoForm.handleSubmit(onSSOSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="ssoProvider" className="form-label">
                    SSO Provider *
                  </Label>
                  <select
                    {...ssoForm.register('provider')}
                    className="form-input"
                  >
                    {ssoProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} - {provider.description}
                      </option>
                    ))}
                  </select>
                  {ssoForm.formState.errors.provider && (
                    <p className="text-red-500 text-sm mt-1">
                      {ssoForm.formState.errors.provider.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientId" className="form-label">
                      Client ID *
                    </Label>
                    <Input
                      id="clientId"
                      {...ssoForm.register('clientId')}
                      className="form-input"
                      placeholder="Enter client ID"
                    />
                    {ssoForm.formState.errors.clientId && (
                      <p className="text-red-500 text-sm mt-1">
                        {ssoForm.formState.errors.clientId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="clientSecret" className="form-label">
                      Client Secret *
                    </Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      {...ssoForm.register('clientSecret')}
                      className="form-input"
                      placeholder="Enter client secret"
                    />
                    {ssoForm.formState.errors.clientSecret && (
                      <p className="text-red-500 text-sm mt-1">
                        {ssoForm.formState.errors.clientSecret.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="domain" className="form-label">
                    Domain *
                  </Label>
                  <Input
                    id="domain"
                    {...ssoForm.register('domain')}
                    className="form-input"
                    placeholder="e.g., company.okta.com"
                  />
                  {ssoForm.formState.errors.domain && (
                    <p className="text-red-500 text-sm mt-1">
                      {ssoForm.formState.errors.domain.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ssoForm.watch('isActive')}
                    onCheckedChange={(checked) => ssoForm.setValue('isActive', checked, { shouldDirty: true })}
                  />
                  <Label className="text-sm font-medium">
                    Active
                  </Label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => ssoForm.reset()}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !ssoForm.formState.isDirty}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    {isLoading ? 'Creating...' : 'Create SSO Config'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing SSO Configs */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle>Existing SSO Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ssoConfigs.map((sso) => (
                  <div key={sso.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(sso.status)}
                        <div>
                          <h4 className="font-medium">
                            {ssoProviders.find(p => p.id === sso.provider)?.name}
                          </h4>
                          <p className="text-sm text-gray-600">{sso.domain}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(sso.status)}
                            <span className="text-xs text-gray-500">
                              Client ID: {sso.clientId}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSSO(sso.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}