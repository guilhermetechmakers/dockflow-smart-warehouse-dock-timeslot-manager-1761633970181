import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Shield,
  UserPlus,
  Save,
  X,
  Check,
  Crown,
  User,
  Settings,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  isActive: z.boolean(),
});

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().min(1, 'Description is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  isActive: z.boolean(),
});

type UserForm = z.infer<typeof userSchema>;
type RoleForm = z.infer<typeof roleSchema>;

interface User extends UserForm {
  id: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface Role extends RoleForm {
  id: string;
  created_at: string;
  updated_at: string;
  user_count: number;
}

const availablePermissions = [
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard' },
  { id: 'schedule.view', name: 'View Schedule', description: 'View booking calendar' },
  { id: 'schedule.edit', name: 'Edit Schedule', description: 'Create and modify bookings' },
  { id: 'schedule.delete', name: 'Delete Schedule', description: 'Delete bookings' },
  { id: 'analytics.view', name: 'View Analytics', description: 'Access to reports and analytics' },
  { id: 'settings.view', name: 'View Settings', description: 'View system settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings' },
  { id: 'users.view', name: 'View Users', description: 'View user list' },
  { id: 'users.edit', name: 'Edit Users', description: 'Create and modify users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete users' },
  { id: 'docks.view', name: 'View Docks', description: 'View dock information' },
  { id: 'docks.edit', name: 'Edit Docks', description: 'Create and modify docks' },
  { id: 'gate.access', name: 'Gate Access', description: 'Access to gate check-in system' },
  { id: 'admin.access', name: 'Admin Access', description: 'Full administrative access' },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'admin',
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_login: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'manager',
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_login: '2024-01-20T09:15:00Z',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    role: 'operator',
    isActive: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_login: '2024-01-19T16:45:00Z',
  },
  {
    id: '4',
    name: 'Lisa Brown',
    email: 'lisa.brown@company.com',
    role: 'viewer',
    isActive: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_login: '2024-01-18T11:20:00Z',
  },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    description: 'Full administrative access to all features',
    permissions: ['admin.access'],
    isActive: true,
    user_count: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'manager',
    description: 'Management access to operations and scheduling',
    permissions: ['dashboard.view', 'schedule.view', 'schedule.edit', 'analytics.view', 'users.view', 'docks.view'],
    isActive: true,
    user_count: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    name: 'operator',
    description: 'Operational access to gate and scheduling',
    permissions: ['dashboard.view', 'schedule.view', 'schedule.edit', 'gate.access', 'docks.view'],
    isActive: true,
    user_count: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '4',
    name: 'viewer',
    description: 'Read-only access to dashboard and reports',
    permissions: ['dashboard.view', 'schedule.view', 'analytics.view'],
    isActive: true,
    user_count: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

export function UsersRolesManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userForm = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      isActive: true,
    },
  });

  const roleForm = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
      isActive: true,
    },
  });

  const selectedPermissions = roleForm.watch('permissions');

  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      userForm.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      userForm.reset({
        name: '',
        email: '',
        role: '',
        isActive: true,
      });
    }
    setIsUserDialogOpen(true);
  };

  const handleOpenRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      roleForm.reset({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
      });
    } else {
      setEditingRole(null);
      roleForm.reset({
        name: '',
        description: '',
        permissions: [],
        isActive: true,
      });
    }
    setIsRoleDialogOpen(true);
  };

  const handleCloseUserDialog = () => {
    setIsUserDialogOpen(false);
    setEditingUser(null);
    userForm.reset();
  };

  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setEditingRole(null);
    roleForm.reset();
  };

  const onUserSubmit = async (data: UserForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingUser) {
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...data, updated_at: new Date().toISOString() }
            : user
        ));
        toast.success('User updated successfully');
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUsers(prev => [...prev, newUser]);
        toast.success('User added successfully');
      }
      
      handleCloseUserDialog();
    } catch (error) {
      toast.error('Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  const onRoleSubmit = async (data: RoleForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingRole) {
        setRoles(prev => prev.map(role => 
          role.id === editingRole.id 
            ? { ...role, ...data, updated_at: new Date().toISOString() }
            : role
        ));
        toast.success('Role updated successfully');
      } else {
        const newRole: Role = {
          id: Date.now().toString(),
          ...data,
          user_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setRoles(prev => [...prev, newRole]);
        toast.success('Role added successfully');
      }
      
      handleCloseRoleDialog();
    } catch (error) {
      toast.error('Failed to save role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role && role.user_count > 0) {
      toast.error('Cannot delete role with assigned users');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this role?')) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setRoles(prev => prev.filter(role => role.id !== roleId));
        toast.success('Role deleted successfully');
      } catch (error) {
        toast.error('Failed to delete role');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePermission = (permissionId: string) => {
    const currentPermissions = selectedPermissions || [];
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];
    roleForm.setValue('permissions', newPermissions, { shouldDirty: true });
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'operator':
        return <Settings className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
            <Users className="h-6 w-6 text-coral-500" />
            Users & Roles Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="roles">Roles ({roles.length})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Users</h3>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleOpenUserDialog()}
                  className="btn-primary flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="form-label">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      {...userForm.register('name')}
                      className="form-input"
                      placeholder="Enter full name"
                    />
                    {userForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {userForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="form-label">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...userForm.register('email')}
                      className="form-input"
                      placeholder="Enter email address"
                    />
                    {userForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {userForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="role" className="form-label">
                      Role *
                    </Label>
                    <select
                      {...userForm.register('role')}
                      className="form-input"
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name} - {role.description}
                        </option>
                      ))}
                    </select>
                    {userForm.formState.errors.role && (
                      <p className="text-red-500 text-sm mt-1">
                        {userForm.formState.errors.role.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={userForm.watch('isActive')}
                      onCheckedChange={(checked) => userForm.setValue('isActive', checked, { shouldDirty: true })}
                    />
                    <Label className="text-sm font-medium">
                      Active
                    </Label>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseUserDialog}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !userForm.formState.isDirty}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isLoading ? 'Saving...' : editingUser ? 'Update User' : 'Add User'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="dockflow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenUserDialog(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Roles</h3>
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleOpenRoleDialog()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? 'Edit Role' : 'Add New Role'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="roleName" className="form-label">
                      Role Name *
                    </Label>
                    <Input
                      id="roleName"
                      {...roleForm.register('name')}
                      className="form-input"
                      placeholder="e.g., supervisor"
                    />
                    {roleForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {roleForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description" className="form-label">
                      Description *
                    </Label>
                    <Input
                      id="description"
                      {...roleForm.register('description')}
                      className="form-input"
                      placeholder="Describe the role's responsibilities"
                    />
                    {roleForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {roleForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="form-label">Permissions *</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto">
                      {availablePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                            selectedPermissions?.includes(permission.id)
                              ? 'bg-coral-50 border-coral-200 text-coral-700'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => togglePermission(permission.id)}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedPermissions?.includes(permission.id)
                              ? 'bg-coral-500 border-coral-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedPermissions?.includes(permission.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{permission.name}</div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {roleForm.formState.errors.permissions && (
                      <p className="text-red-500 text-sm mt-1">
                        {roleForm.formState.errors.permissions.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={roleForm.watch('isActive')}
                      onCheckedChange={(checked) => roleForm.setValue('isActive', checked, { shouldDirty: true })}
                    />
                    <Label className="text-sm font-medium">
                      Active
                    </Label>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseRoleDialog}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !roleForm.formState.isDirty}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isLoading ? 'Saving...' : editingRole ? 'Update Role' : 'Add Role'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="dockflow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.name)}
                          <span className="font-medium">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{role.description}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {role.permissions.slice(0, 2).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {role.user_count} user{role.user_count !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={role.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {role.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRoleDialog(role)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={role.user_count > 0}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}