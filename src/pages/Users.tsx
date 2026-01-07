import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getAppCheckToken } from '@/lib/appCheck';
import { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useLogging } from '@/hooks/useLogging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Search, UserCheck, UserX, Shield, Plus, KeyRound, Ban } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ALLOWED_EMAIL_DOMAIN } from '@/utils/domainValidation';
import { useTranslation } from '@/contexts/TranslationContext';

const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .refine(
      (email) => email.toLowerCase().trim().endsWith(ALLOWED_EMAIL_DOMAIN),
      { message: `Email must be a ${ALLOWED_EMAIL_DOMAIN} address` }
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['users', 'semi-admin', 'admin', 'dev']),
  approved: z.boolean().default(false)
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const { user: currentUser } = useAuth();
  const { logUserAction } = useLogging();
  const { t } = useTranslation();

  const createUserForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'users',
      approved: false
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserApproval = async (userId: string, approved: boolean) => {
    if (!currentUser || !['dev', 'admin'].includes(currentUser.role)) {
      toast.error('Unauthorized');
      return;
    }

    setUpdatingUsers(prev => new Set(prev).add(userId));
    
    try {
      await updateDoc(doc(db, 'users', userId), { approved });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, approved } : user
      ));
      toast.success(`User ${approved ? 'approved' : 'suspended'} successfully`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!currentUser || !['dev', 'admin'].includes(currentUser.role)) {
      toast.error('Unauthorized');
      return;
    }

    // Admins cannot assign dev role or modify dev users
    const targetUser = users.find(u => u.id === userId);
    if (currentUser.role === 'admin' && (role === 'dev' || targetUser?.role === 'dev')) {
      toast.error('Insufficient permissions');
      return;
    }

    setUpdatingUsers(prev => new Set(prev).add(userId));
    
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: role as User['role'] } : user
      ));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const createUser = async (data: CreateUserFormData) => {
    if (!currentUser || currentUser.role !== 'dev') {
      toast.error('Unauthorized');
      return;
    }

    setIsCreatingUser(true);
    
    try {
      // Get App Check token for enforced endpoints
      const appCheckToken = await getAppCheckToken();

      // Create user in Firebase Auth using REST API
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC8-gUpAw7jqdCb63DVt6O5KZ7ISt-GXsA'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } as Record<string, string> : {})
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          returnSecureToken: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || 'Failed to create user');
      }

      const authResult = await response.json();

      // Create user document in Firestore using the Firebase Auth UID
      const userDoc = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        approved: data.approved,
        created_at: serverTimestamp(),
        blocked: false
      };

      // Use the Firebase Auth UID as the Firestore document ID
      await setDoc(doc(db, 'users', authResult.localId), userDoc);

      // Log the user creation
      await logUserAction.create(authResult.localId, `Created user: ${data.first_name} ${data.last_name} (${data.email})`);

      // Refresh users list
      await fetchUsers();
      
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      createUserForm.reset();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const blockUser = async (userId: string, blocked: boolean) => {
    if (!currentUser || !['dev', 'admin'].includes(currentUser.role)) {
      toast.error('Unauthorized');
      return;
    }

    // Admins cannot block dev users
    const targetUser = users.find(u => u.id === userId);
    if (currentUser.role === 'admin' && targetUser?.role === 'dev') {
      toast.error('Cannot block dev users');
      return;
    }

    setUpdatingUsers(prev => new Set(prev).add(userId));
    
    try {
      await updateDoc(doc(db, 'users', userId), { blocked });
      
      // Log the block/unblock action
      if (blocked) {
        await logUserAction.block(userId);
      } else {
        await logUserAction.unblock(userId);
      }
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, blocked } : user
      ));
      toast.success(`User ${blocked ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const resetUserPassword = async (userEmail: string) => {
    if (!currentUser || !['dev', 'admin'].includes(currentUser.role)) {
      toast.error('Unauthorized');
      return;
    }

    try {
      // Get App Check token for enforced endpoints
      const appCheckToken = await getAppCheckToken();

      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC8-gUpAw7jqdCb63DVt6O5KZ7ISt-GXsA'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } as Record<string, string> : {})
        },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: userEmail
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || 'Failed to send password reset email');
      }

      // Log the password reset
      const targetUser = users.find(u => u.email === userEmail);
      if (targetUser) {
        await logUserAction.resetPassword(targetUser.id);
      }
      
      toast.success('Password reset email sent successfully');
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast.error(error.message || 'Failed to send password reset email');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'dev': return 'default';
      case 'admin': return 'secondary';
      case 'semi-admin': return 'outline';
      case 'users': return 'outline';
      default: return 'outline';
    }
  };

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser || !['dev', 'admin'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('users.accessDenied')}</h3>
          <p className="text-gray-600">{t('users.noPermission')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
        <p className="text-gray-600">{t('users.description')}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t('users.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{t('users.totalUsers')}: {users.length}</span>
            <span>•</span>
            <span>{t('users.approved')}: {users.filter(u => u.approved).length}</span>
            <span>•</span>
            <span>{t('users.blocked')}: {users.filter(u => (u as any).blocked).length}</span>
          </div>
        </div>
        
        {currentUser?.role === 'dev' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('users.createUser')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('users.createNewUser')}</DialogTitle>
              </DialogHeader>
              <Form {...createUserForm}>
                <form onSubmit={createUserForm.handleSubmit(createUser)} className="space-y-4">
                  <FormField
                    control={createUserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.email')}</FormLabel>
                        <FormControl>
                          <Input placeholder={`user${ALLOWED_EMAIL_DOMAIN}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('users.password')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createUserForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('users.firstName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createUserForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('users.lastName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createUserForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.role')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="users">Users</SelectItem>
                            <SelectItem value="semi-admin">Semi Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="dev">Developer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name="approved"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium">
                          {t('users.approveImmediately')}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreatingUser}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={isCreatingUser}>
                      {isCreatingUser ? t('users.creating') : t('users.createUser')}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <UserX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('logs.noLogsFound')}</h3>
                  <p className="text-gray-600">
                    {searchTerm ? t('logs.tryAdjusting') : t('logs.noActivityLogs')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.approved ? (
                        <UserCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <UserX className="h-5 w-5 text-red-600" />
                      )}
                      {(user as any).blocked && (
                        <Ban className="h-5 w-5 text-red-600" />
                      )}
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{t('users.approved')}:</span>
                          <Switch
                            checked={user.approved || false}
                            onCheckedChange={(checked) => updateUserApproval(user.id, checked)}
                            disabled={updatingUsers.has(user.id) || !['dev', 'admin'].includes(currentUser.role)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{t('users.blocked')}:</span>
                          <Switch
                            checked={(user as any).blocked || false}
                            onCheckedChange={(checked) => blockUser(user.id, checked)}
                            disabled={updatingUsers.has(user.id) || !['dev', 'admin'].includes(currentUser.role) || (currentUser.role === 'admin' && user.role === 'dev')}
                          />
                        </div>
                        {['dev', 'admin'].includes(currentUser.role) && !(currentUser.role === 'admin' && user.role === 'dev') && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{t('users.role')}:</span>
                            <Select
                              value={user.role}
                              onValueChange={(value) => updateUserRole(user.id, value)}
                              disabled={updatingUsers.has(user.id)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="users">Users</SelectItem>
                                <SelectItem value="semi-admin">Semi Admin</SelectItem>
                                <SelectItem value="admin" disabled={currentUser.role === 'admin'}>Admin</SelectItem>
                                <SelectItem value="dev" disabled={currentUser.role === 'admin'}>Developer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      {user.created_at && (
                        <p className="text-xs text-gray-500">
                          Joined: {user.created_at instanceof Date ? user.created_at.toLocaleDateString() : new Date((user.created_at as any).seconds * 1000).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    {['dev', 'admin'].includes(currentUser.role) && (
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetUserPassword(user.email)}
                          disabled={updatingUsers.has(user.id)}
                        >
                          <KeyRound className="h-4 w-4 mr-2" />
                          {t('users.resetPassword')}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Users;