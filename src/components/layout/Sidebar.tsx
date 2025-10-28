import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Settings, 
  User, 
  Warehouse,
  QrCode,
  FileText,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Operations', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

const quickActions = [
  { name: 'Gate Check-in', href: '/gate', icon: QrCode },
  { name: 'Warehouse', href: '/admin', icon: Warehouse },
  { name: 'Reports', href: '/dashboard/analytics', icon: FileText },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const signOut = useSignOut();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-500">
                <Warehouse className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-dark">DockFlow</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              ×
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "nav-item group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive ? "nav-item-active" : ""
                    )
                  }
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-6">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </div>
              <div className="space-y-1">
                {quickActions.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className="nav-item group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                    onClick={onClose}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-coral-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-coral-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-dark">John Doe</p>
                <p className="text-xs text-gray-500">Operations Manager</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut.mutate()}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
