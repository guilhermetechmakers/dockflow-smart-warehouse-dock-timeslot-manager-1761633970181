import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Truck, 
  Settings, 
  Users, 
  Plug, 
  Bell,
  ChevronRight,
  Save,
  RefreshCw
} from 'lucide-react';
import { WarehouseConfig } from '@/components/settings/WarehouseConfig';
import { DocksManagement } from '@/components/settings/DocksManagement';
import { SlotRulesConfig } from '@/components/settings/SlotRulesConfig';
import { UsersRolesManagement } from '@/components/settings/UsersRolesManagement';
import { IntegrationsSetup } from '@/components/settings/IntegrationsSetup';
import { NotificationTemplates } from '@/components/settings/NotificationTemplates';

const settingsSections = [
  {
    id: 'warehouse',
    label: 'Warehouse Config',
    icon: Building2,
    description: 'Configure warehouse details and operational hours'
  },
  {
    id: 'docks',
    label: 'Docks List',
    icon: Truck,
    description: 'Manage dock locations and capabilities'
  },
  {
    id: 'slot-rules',
    label: 'Slot Rules',
    icon: Settings,
    description: 'Define booking rules and policies'
  },
  {
    id: 'users-roles',
    label: 'Users & Roles',
    icon: Users,
    description: 'Manage user access and permissions'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    description: 'Connect external systems and APIs'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Configure email and SMS templates'
  }
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('warehouse');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'warehouse':
        return <WarehouseConfig />;
      case 'docks':
        return <DocksManagement />;
      case 'slot-rules':
        return <SlotRulesConfig />;
      case 'users-roles':
        return <UsersRolesManagement />;
      case 'integrations':
        return <IntegrationsSetup />;
      case 'notifications':
        return <NotificationTemplates />;
      default:
        return <WarehouseConfig />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Settings & Preferences</h1>
          <p className="text-gray-600 mt-1">
            Configure warehouse settings, manage users, and set up integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeTab === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-coral-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-coral-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{section.label}</div>
                          <div className={`text-xs ${
                            isActive ? 'text-coral-100' : 'text-gray-500'
                          }`}>
                            {section.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${
                        isActive ? 'rotate-90' : ''
                      }`} />
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
