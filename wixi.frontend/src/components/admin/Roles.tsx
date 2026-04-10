import React, { useEffect, useState } from 'react';
import { RoleService } from '../../ApiServices/services/RoleService';
import type { RoleDto, UserDto } from '../../ApiServices/services/RoleService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { 
  Plus, 
  UserPlus, 
  Shield, 
  Users, 
  Search, 
  Edit, 
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  // Dialog states
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  
  // Form states
  const [newRole, setNewRole] = useState('');
  const [newUser, setNewUser] = useState({ 
    email: '', 
    password: '', 
    firstName: '', 
    lastName: '', 
    role: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [r, u] = await Promise.all([
        RoleService.listRoles(), 
        RoleService.listUsers()
      ]);
      setRoles(r);
      setUsers(u);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!createUserDialogOpen) {
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: '' });
      setShowPassword(false);
    }
  }, [createUserDialogOpen]);

  const handleCreateRole = async () => {
    if (!newRole.trim()) {
      toast.error('Rol adı gereklidir');
      return;
    }

    try {
      setCreating(true);
      await RoleService.createRole(newRole.trim());
      toast.success('Rol başarıyla oluşturuldu');
      setNewRole('');
      setCreateRoleDialogOpen(false);
      await load();
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast.error(error.message || 'Rol oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('E-posta ve şifre gereklidir');
      return;
    }

    try {
      setCreating(true);
      await RoleService.createUser({
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.firstName || undefined,
        lastName: newUser.lastName || undefined,
        role: newUser.role || undefined
      });
      toast.success('Kullanıcı başarıyla oluşturuldu');
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: '' });
      setCreateUserDialogOpen(false);
      await load();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Kullanıcı oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Kullanıcı ve rol seçilmelidir');
      return;
    }

    try {
      setCreating(true);
      await RoleService.assign(selectedUser.id, selectedRole);
      toast.success('Rol başarıyla atandı');
      setSelectedRole('');
      setAssignRoleDialogOpen(false);
      await load();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast.error(error.message || 'Rol atanırken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveRole = async (userId: number, role: string) => {
    if (!confirm(`${role} rolünü kaldırmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await RoleService.remove(userId, role);
      toast.success('Rol başarıyla kaldırıldı');
      await load();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error(error.message || 'Rol kaldırılırken hata oluştu');
    }
  };

  const filteredUsers = users.filter(u => {
    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim().toLowerCase() || u.userName.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      u.userName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcılar ve Rol Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Rolleri ve kullanıcı yetkilerini yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createRoleDialogOpen} onOpenChange={setCreateRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Rol Oluştur</DialogTitle>
                <DialogDescription>
                  Sistem için yeni bir rol ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="roleName">Rol Adı</Label>
                    <Input
                      id="roleName"
                      placeholder="Örn: Editor, Moderator"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateRole()}
                      className="border-2"
                    />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateRoleDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button onClick={handleCreateRole} disabled={creating || !newRole.trim()}>
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    'Oluştur'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
                <DialogDescription>
                  Sisteme yeni bir kullanıcı ekleyin (Client rolü hariç)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      placeholder="Ad"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      placeholder="Soyad"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      className="border-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="border-2"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifre *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="border-2 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="userRole">Rol (Opsiyonel)</Label>
                  <Select
                    value={newUser.role || ''}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger id="userRole" className="border-2">
                      <SelectValue placeholder="Rol seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Rol yok</SelectItem>
                      {roles
                        .filter((r) => r.name.toLowerCase() !== 'client')
                        .map((r) => (
                          <SelectItem key={r.id} value={r.name}>
                            {r.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateUserDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={creating || !newUser.email || !newUser.password}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    'Oluştur'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Rol</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold">{filteredUsers.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle>Roller</CardTitle>
            <CardDescription>
              Sistemde tanımlı tüm roller
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Henüz rol tanımlanmamış
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <Badge
                    key={r.id}
                    variant="secondary"
                    className="px-4 py-2 text-sm"
                  >
                    <Shield className="w-3 h-3 mr-2" />
                    {r.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kullanıcılar</CardTitle>
                <CardDescription>
                  Sistemdeki tüm kullanıcılar
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? 'Kullanıcı bulunamadı' : 'Henüz kullanıcı yok'}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => {
                      const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.userName;
                      return (
                        <TableRow
                          key={u.id}
                          className={selectedUser?.id === u.id ? 'bg-muted/50' : ''}
                        >
                          <TableCell>
                            <div className="font-medium">{fullName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setAssignRoleDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Rol Ata
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={assignRoleDialogOpen} onOpenChange={setAssignRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rol Ata / Kaldır</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  <strong>{selectedUser.userName}</strong> kullanıcısına rol atayın veya kaldırın
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="roleSelect">Rol Seçin</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="roleSelect">
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.name}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAssignRole}
                  disabled={!selectedRole || creating}
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Atanıyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Rol Ata
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedRole) {
                      handleRemoveRole(selectedUser.id, selectedRole);
                    }
                  }}
                  disabled={!selectedRole || creating}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rol Kaldır
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setAssignRoleDialogOpen(false);
                setSelectedUser(null);
                setSelectedRole('');
              }}
            >
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;
