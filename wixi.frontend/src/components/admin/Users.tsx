import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaTrash, FaPlus, FaUserShield, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import { API_ROUTES } from '../../ApiServices/config/api.config';
import { TokenService } from '../../ApiServices/services/TokenService';
import { RoleService } from '../../ApiServices/services/RoleService';
import DatabaseService from '../../ApiServices/services/DatabaseService';
import { useToast } from '../../hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Button } from '../ui/button';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminCount: number;
  regularUsers: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: '' });
  const { toast } = useToast();
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [page]);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = await TokenService.getInstance().getToken(true);
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Oturum açmanız gerekiyor.',
        });
        setLoading(false);
        return;
      }

      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const url = `${API_ROUTES.ADMIN.USERS}?page=${page}&pageSize=${pageSize}${searchParam}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = 'Kullanıcılar yüklenemedi';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: errorMessage,
        });
        
        console.error('Kullanıcılar yüklenemedi:', {
          status: response.status,
          statusText: response.statusText,
          url
        });
        
        setUsers([]);
        setTotal(0);
        return;
      }

      const data = await response.json();
      
      // Backend returns: { success: true, total, page, pageSize, items: [...] }
      if (data.success && Array.isArray(data.items)) {
        // Map backend response to frontend format
        const mappedUsers = data.items.map((item: any) => ({
          id: item.id || item.Id,
          firstName: item.firstName || item.FirstName || '',
          lastName: item.lastName || item.LastName || '',
          email: item.email || item.Email || '',
          roles: Array.isArray(item.roles) ? item.roles : (Array.isArray(item.Roles) ? item.Roles : []),
          isActive: item.isActive ?? item.IsActive ?? true,
          createdAt: item.createdAt || item.CreatedAt || new Date().toISOString()
        }));
        
        setUsers(mappedUsers);
        setTotal(data.total || 0);
      } else {
        // Fallback: try direct array
        if (Array.isArray(data)) {
          setUsers(data);
          setTotal(data.length);
        } else {
          console.warn('Unexpected response format:', data);
          setUsers([]);
          setTotal(0);
        }
      }
    } catch (error: any) {
      console.error('Kullanıcılar yüklenemedi:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message || 'Kullanıcılar yüklenirken bir hata oluştu.',
      });
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const token = await TokenService.getInstance().getToken(true);
      if (!token) return;

      const response = await fetch(API_ROUTES.ADMIN.USERS_STATS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Kullanıcı istatistikleri yüklenemedi:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      
      // Backend returns: { totalUsers, activeUsers, inactiveUsers, adminCount, regularUsers }
      setStats({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        inactiveUsers: data.inactiveUsers || 0,
        adminCount: data.adminCount || 0,
        regularUsers: data.regularUsers || 0
      });
    } catch (error) {
      console.error('Kullanıcı istatistikleri yüklenemedi:', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">Kullanıcılar</h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Tüm kullanıcıları yönetin</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 whitespace-nowrap">
          <FaPlus />
          <span className="hidden sm:inline">Yeni Kullanıcı</span>
          <span className="sm:hidden">Yeni</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Kullanıcı ara (isim, email)..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
            >
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">{stats?.totalUsers ?? '-'}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg transition-colors duration-300">
              <FaUser className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Aktif Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                {stats?.activeUsers ?? '-'}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg transition-colors duration-300">
              <FaUserShield className="text-2xl text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Admin</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                {stats?.adminCount ?? '-'}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg transition-colors duration-300">
              <FaUserShield className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Pasif Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                {stats?.inactiveUsers ?? '-'}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg transition-colors duration-300">
              <FaUser className="text-2xl text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Roller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-semibold transition-colors duration-300">
                          {(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email || 'İsimsiz Kullanıcı'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                              role === 'Admin'
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}
                          >
                            {role}
                          </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Rol Yok
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                          user.isActive
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200">
                          <FaEdit />
                        </button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Toplam {total} kullanıcı, {Math.ceil(total / pageSize)} sayfa
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Önceki
              </button>
              <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {page} / {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Yeni Kullanıcı</h3>
              <button onClick={() => setShowCreate(false)} className="px-3 py-1 rounded-md border dark:border-gray-700">Kapat</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="px-3 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="Ad" value={form.firstName} onChange={(e)=>setForm(v=>({...v, firstName:e.target.value}))} />
              <input className="px-3 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="Soyad" value={form.lastName} onChange={(e)=>setForm(v=>({...v, lastName:e.target.value}))} />
              <input className="px-3 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="Email" value={form.email} onChange={(e)=>setForm(v=>({...v, email:e.target.value}))} />
              <input type="password" className="px-3 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="Şifre" value={form.password} onChange={(e)=>setForm(v=>({...v, password:e.target.value}))} />
              <input className="px-3 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 md:col-span-2" placeholder="Rol (opsiyonel)" value={form.role} onChange={(e)=>setForm(v=>({...v, role:e.target.value}))} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=>setShowCreate(false)} className="px-4 py-2 rounded-lg border dark:border-gray-700">İptal</button>
              <button
                onClick={async ()=>{
                  if(!form.email || !form.password) {
                    toast({
                      variant: 'destructive',
                      title: 'Hata',
                      description: 'Email ve şifre gereklidir.',
                    });
                    return;
                  }
                  try {
                    await RoleService.createUser({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, role: form.role || undefined });
                    toast({
                      title: 'Başarılı',
                      description: 'Kullanıcı başarıyla oluşturuldu.',
                    });
                    setShowCreate(false);
                    setForm({ firstName:'', lastName:'', email:'', password:'', role:'' });
                    await loadUsers();
                    await loadUserStats();
                  } catch (error: any) {
                    toast({
                      variant: 'destructive',
                      title: 'Hata',
                      description: error.message || 'Kullanıcı oluşturulamadı.',
                    });
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
              >Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

