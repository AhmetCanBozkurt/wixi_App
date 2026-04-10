import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  Users, 
  Search, 
  Save,
  Loader2,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  GripVertical,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { menuPermissionService } from '../../ApiServices/services';
import { RoleService } from '../../ApiServices/services/RoleService';
import type { 
  MenuPermissionByUserDto, 
  MenuPermissionDto,
  MenuPermissionItemDto
} from '../../ApiServices/types/MenuPermissionTypes';
import type { UserDto } from '../../ApiServices/services/RoleService';

// All available menu items
const ALL_MENU_ITEMS: MenuPermissionItemDto[] = [
  // Ana Menü
  { menuPath: '/admin', menuText: 'Dashboard', menuCategory: 'Ana Menü', isVisible: true, displayOrder: 1 },
  { menuPath: '/admin/reports', menuText: 'Raporlar', menuCategory: 'Ana Menü', isVisible: true, displayOrder: 2 },
  { menuPath: '/admin/roles', menuText: 'Kullanıcılar ve Rol Yönetimi', menuCategory: 'Ana Menü', isVisible: true, displayOrder: 3 },
  { menuPath: '/admin/settings', menuText: 'Ayarlar', menuCategory: 'Ana Menü', isVisible: true, displayOrder: 4 },
  
  // DISABLED FOR TEKSTIL PROJECT - Başvurular
  // { menuPath: '/admin/employee-submissions', menuText: 'Çalışan Başvuruları', menuCategory: 'Başvurular', isVisible: true, displayOrder: 5 },
  // { menuPath: '/admin/employer-submissions', menuText: 'İşveren Başvuruları', menuCategory: 'Başvurular', isVisible: true, displayOrder: 6 },
  // { menuPath: '/admin/contact-submissions', menuText: 'İletişim Başvuruları', menuCategory: 'Başvurular', isVisible: true, displayOrder: 7 },
  
  // DISABLED FOR TEKSTIL PROJECT - Müşteri Yönetimi
  // { menuPath: '/admin/client-tracking', menuText: 'Müşteri Takip', menuCategory: 'Müşteri Yönetimi', isVisible: true, displayOrder: 8 },
  // { menuPath: '/admin/application-templates', menuText: 'Başvuru Şablonları', menuCategory: 'Müşteri Yönetimi', isVisible: true, displayOrder: 9 },
  // { menuPath: '/admin/document-types', menuText: 'Belge Türleri', menuCategory: 'Müşteri Yönetimi', isVisible: true, displayOrder: 10 },
  // { menuPath: '/admin/document-review', menuText: 'Belge İnceleme', menuCategory: 'Müşteri Yönetimi', isVisible: true, displayOrder: 11 },
  // { menuPath: '/admin/support-management', menuText: 'Destek Yönetimi', menuCategory: 'Müşteri Yönetimi', isVisible: true, displayOrder: 12 },
  // { menuPath: '/admin/faq-management', menuText: 'SSS Yönetimi', menuCategory: 'Müşteri Yönetimi', isVisible: true, displayOrder: 13 },
  
  // Lisans Yönetimi
  //{ menuPath: '/admin/tenants', menuText: 'Müşteriler', menuCategory: 'Lisans Yönetimi', isVisible: true, displayOrder: 14 },
  // { menuPath: '/admin/licenses', menuText: 'Lisanslar', menuCategory: 'Lisans Yönetimi', isVisible: true, displayOrder: 15 },
  
  // Randevu Yönetimi (dev only)
  ///{ menuPath: '/admin/appointments', menuText: 'Randevu Takvimi', menuCategory: 'Randevu Yönetimi', isVisible: true, displayOrder: 14 },
 // { menuPath: '/admin/appointments-list', menuText: 'Randevu Listesi', menuCategory: 'Randevu Yönetimi', isVisible: true, displayOrder: 15 },
  
  // Ödeme Yönetimi (dev only)
 // { menuPath: '/admin/payments', menuText: 'Ödeme İşlemleri', menuCategory: 'Ödeme Yönetimi', isVisible: true, displayOrder: 16 },
  
  // DISABLED FOR TEKSTIL PROJECT - İçerik Yönetimi
  // { menuPath: '/admin/content-management', menuText: 'İçerik Yönetimi', menuCategory: 'İçerik Yönetimi', isVisible: true, displayOrder: 17 },
  // { menuPath: '/admin/testimonials', menuText: 'Müşteri Referansları', menuCategory: 'İçerik Yönetimi', isVisible: true, displayOrder: 18 },
  // { menuPath: '/admin/project-references', menuText: 'Proje Referansları', menuCategory: 'İçerik Yönetimi', isVisible: true, displayOrder: 19 },
  // { menuPath: '/admin/equivalency-fee-settings', menuText: 'Denklik Ücreti Ayarları', menuCategory: 'İçerik Yönetimi', isVisible: true, displayOrder: 20 },
  
  // Tekstil Yönetimi
  { menuPath: '/admin/tekstil/languages', menuText: 'Diller', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 17 },
  { menuPath: '/admin/tekstil/about', menuText: 'Hakkımızda', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 18 },
  { menuPath: '/admin/tekstil/stats', menuText: 'İstatistikler', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 19 },
  { menuPath: '/admin/tekstil/product-categories', menuText: 'Ürün Kategorileri', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 20 },
  { menuPath: '/admin/tekstil/products', menuText: 'Ürünler', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 21 },
  { menuPath: '/admin/tekstil/project-categories', menuText: 'Proje Kategorileri', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 22 },
  { menuPath: '/admin/tekstil/projects', menuText: 'Projeler', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 23 },
  { menuPath: '/admin/tekstil/contact-submissions', menuText: 'İletişim Formları', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 24 },
  { menuPath: '/admin/tekstil/contact-info', menuText: 'İletişim Bilgileri', menuCategory: 'Tekstil Yönetimi', isVisible: true, displayOrder: 25 },
  
  // E-posta Yönetimi
  { menuPath: '/admin/smtp-settings', menuText: 'SMTP Ayarları', menuCategory: 'E-posta Yönetimi', isVisible: true, displayOrder: 21 },
  { menuPath: '/admin/email-logs', menuText: 'E-posta Logları', menuCategory: 'E-posta Yönetimi', isVisible: true, displayOrder: 22 },
  { menuPath: '/admin/email-templates', menuText: 'E-posta Şablonları', menuCategory: 'E-posta Yönetimi', isVisible: true, displayOrder: 23 },
  
  // Sistem
  { menuPath: '/admin/team-members', menuText: 'Takım Üyeleri', menuCategory: 'Sistem', isVisible: true, displayOrder: 24 },
  { menuPath: '/admin/news', menuText: 'Haberler', menuCategory: 'Sistem', isVisible: true, displayOrder: 25 },
  { menuPath: '/admin/application-logs', menuText: 'Uygulama Logları', menuCategory: 'Sistem', isVisible: true, displayOrder: 26 },
  { menuPath: '/admin/translations', menuText: 'Çeviriler', menuCategory: 'Sistem', isVisible: true, displayOrder: 27 },
 // { menuPath: '/admin/holidays', menuText: 'Tatiller', menuCategory: 'Sistem', isVisible: true, displayOrder: 28 },
  { menuPath: '/admin/menu-permissions', menuText: 'Menü İzinleri', menuCategory: 'Sistem', isVisible: true, displayOrder: 29 },
  { menuPath: '/admin/license-key', menuText: 'Lisans Yönetimi', menuCategory: 'Sistem', isVisible: true, displayOrder: 30 },
];

const MenuPermissionManagement: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userPermissions, setUserPermissions] = useState<MenuPermissionDto[]>([]);
  const [menuItems, setMenuItems] = useState<MenuPermissionItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserPermissions();
    } else {
      setUserPermissions([]);
      setMenuItems([]);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await RoleService.listUsers();
      console.log('Loaded users from API:', userList); // Debug log
      
      // Backend already excludes Client role users
      // Filter to show only Admin and Employee roles
      const filteredUsers = userList.filter(user => {
        // If user has no roles, exclude them
        if (!user.roles || user.roles.length === 0) {
          console.log('User with no roles excluded:', user);
          return false;
        }
        
        // Check if user has Admin or Employee role
        const hasValidRole = user.roles.some(role => {
          const roleLower = String(role).toLowerCase().trim();
          return roleLower === 'admin' || 
                 roleLower === 'employee' ||
                 roleLower === 'çalışan';
        });
        
        if (!hasValidRole) {
          console.log('User without Admin/Employee role excluded:', user, 'Roles:', user.roles);
        }
        
        return hasValidRole;
      });
      
      console.log('Filtered users (Admin/Employee only):', filteredUsers);
      setUsers(filteredUsers);
      
      if (filteredUsers.length === 0) {
        if (userList.length > 0) {
          toast.warning('Admin veya Employee rolüne sahip kullanıcı bulunamadı');
        } else {
          toast.info('Henüz kullanıcı bulunmuyor');
        }
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Kullanıcılar yüklenirken hata oluştu');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      console.log('Loading permissions for user:', selectedUserId);
      const permissions = await menuPermissionService.getMenuPermissionsByUserId(selectedUserId);
      console.log('Loaded permissions:', permissions);
      
      if (!permissions || !Array.isArray(permissions)) {
        console.warn('Invalid permissions data:', permissions);
        setUserPermissions([]);
        setMenuItems(ALL_MENU_ITEMS);
        return;
      }
      
      setUserPermissions(permissions);

      // Merge with all menu items
      const mergedItems = ALL_MENU_ITEMS.map(item => {
        const existing = permissions.find(p => p && p.menuPath === item.menuPath);
        return {
          ...item,
          isVisible: existing ? existing.isVisible : item.isVisible,
          displayOrder: existing ? existing.displayOrder : item.displayOrder
        };
      });

      console.log('Merged menu items:', mergedItems);
      setMenuItems(mergedItems);
    } catch (error: any) {
      console.error('Error loading user permissions:', error);
      toast.error(error.message || 'Menü izinleri yüklenirken hata oluştu');
      setUserPermissions([]);
      setMenuItems(ALL_MENU_ITEMS); // Set default items on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedUserId) {
      toast.error('Lütfen bir kullanıcı seçin');
      return;
    }

    try {
      setSaving(true);
      await menuPermissionService.bulkUpdateMenuPermissions(selectedUserId, menuItems);
      toast.success('Menü izinleri başarıyla kaydedildi');
      await loadUserPermissions();
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving menu permissions:', error);
      toast.error(error.message || 'Menü izinleri kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = (menuPath: string) => {
    setMenuItems(prev => prev.map(item => 
      item.menuPath === menuPath 
        ? { ...item, isVisible: !item.isVisible }
        : item
    ));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleMoveItem = (menuPath: string, direction: 'up' | 'down') => {
    setMenuItems(prev => {
      const items = [...prev];
      const currentIndex = items.findIndex(item => item.menuPath === menuPath);
      if (currentIndex === -1) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;

      // Swap display orders
      const currentOrder = items[currentIndex].displayOrder;
      const targetOrder = items[targetIndex].displayOrder;
      
      items[currentIndex].displayOrder = targetOrder;
      items[targetIndex].displayOrder = currentOrder;

      return items.sort((a, b) => a.displayOrder - b.displayOrder);
    });
  };

  const expandAllCategories = () => {
    const allCategories = new Set(Object.keys(groupedMenuItems));
    setExpandedCategories(allCategories);
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  const handleInitialize = async () => {
    if (!selectedUserId) {
      toast.error('Lütfen bir kullanıcı seçin');
      return;
    }

    try {
      setSaving(true);
      await menuPermissionService.initializeDefaultMenuPermissions(selectedUserId);
      toast.success('Varsayılan menü izinleri başarıyla oluşturuldu');
      await loadUserPermissions();
    } catch (error: any) {
      console.error('Error initializing menu permissions:', error);
      toast.error(error.message || 'Varsayılan menü izinleri oluşturulurken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    return fullName.includes(search) || 
           (user.email || '').toLowerCase().includes(search) ||
           (user.userName || '').toLowerCase().includes(search);
  });

  const selectedUser = users.find(u => u.id === selectedUserId);
  const groupedMenuItems = (menuItems || []).reduce((acc, item) => {
    if (!item || !item.menuPath) return acc; // Skip invalid items
    const category = item.menuCategory || 'Diğer';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuPermissionItemDto[]>);

  // Initialize expanded categories on dialog open
  useEffect(() => {
    if (editDialogOpen && menuItems && menuItems.length > 0) {
      const categories = new Set<string>();
      menuItems.forEach(item => {
        if (item && item.menuCategory) {
          categories.add(item.menuCategory);
        }
      });
      setExpandedCategories(categories);
    } else if (!editDialogOpen) {
      setExpandedCategories(new Set());
    }
  }, [editDialogOpen, menuItems]);

  // Get visible menu items for preview
  const visibleMenuItems = menuItems
    .filter(item => item.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Menü İzinleri Yönetimi
          </CardTitle>
          <CardDescription>
            Kullanıcıların admin panelinde görebileceği menü öğelerini yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* User Selection */}
            <div className="space-y-2">
              <Label>Kullanıcı Seçin</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedUserId?.toString() || ''}
                  onValueChange={(value) => setSelectedUserId(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Kullanıcı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map(user => {
                        if (!user || !user.id) return null;
                        const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.userName || `User ${user.id}`;
                        const rolesText = user.roles && Array.isArray(user.roles) && user.roles.length > 0 
                          ? ` (${user.roles.join(', ')})` 
                          : '';
                        return (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {`${displayName}${rolesText}`}
                          </SelectItem>
                        );
                      }).filter(Boolean)
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        {loading ? 'Yükleniyor...' : 'Kullanıcı bulunamadı'}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedUser && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="font-semibold">
                    {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.email || selectedUser.userName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  {selectedUser.roles && Array.isArray(selectedUser.roles) && selectedUser.roles.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {selectedUser.roles.map(role => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {userPermissions.length === 0 && (
                    <Button
                      variant="outline"
                      onClick={handleInitialize}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Varsayılan İzinleri Oluştur
                    </Button>
                  )}
                  <Button
                    onClick={() => setEditDialogOpen(true)}
                    disabled={loading}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Menü İzinlerini Düzenle
                  </Button>
                </div>
              </div>
            )}

            {/* Current Permissions Summary */}
            {selectedUser && userPermissions.length > 0 && (
              <div className="space-y-2">
                <Label>Mevcut İzinler</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {userPermissions
                    .filter(p => p.isVisible)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(permission => (
                      <Badge key={permission.id} variant="outline" className="justify-start">
                        <Eye className="w-3 h-3 mr-1" />
                        {permission.menuText}
                      </Badge>
                    ))}
                </div>
                <p className="text-sm text-gray-500">
                  Toplam {userPermissions.filter(p => p.isVisible).length} menü öğesi görünür
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Menü İzinlerini Düzenle</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Düzenleme Modu
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Önizleme
                    </>
                  )}
                </Button>
                {!previewMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={expandAllCategories}
                    >
                      Tümünü Aç
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={collapseAllCategories}
                    >
                      Tümünü Kapat
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedUser && `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser?.email} için menü görünürlüğünü ayarlayın
            </DialogDescription>
          </DialogHeader>
          
          {previewMode ? (
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                  Menü Önizlemesi
                </h3>
                <div className="space-y-2">
                  {menuItems && menuItems.length > 0 ? (
                    Object.entries(groupedMenuItems || {}).map(([category, items]) => {
                      if (!category || !items || !Array.isArray(items)) return null;
                      const visibleItems = items.filter(item => item && item.isVisible);
                      if (visibleItems.length === 0) return null;
                      
                      const isExpanded = expandedCategories.has(category);
                      
                      return (
                        <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {category}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {visibleItems.length} öğe
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            )}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-2 space-y-1 bg-white dark:bg-gray-800">
                            {visibleItems
                              .sort((a, b) => (a?.displayOrder || 0) - (b?.displayOrder || 0))
                              .map(item => {
                                if (!item || !item.menuPath) return null;
                                return (
                                  <div
                                    key={item.menuPath}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                                  >
                                  <Eye className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {item.menuText}
                                  </span>
                                  <Badge variant="outline" className="text-xs ml-auto">
                                    #{item.displayOrder}
                                  </Badge>
                                </div>
                                );
                              })
                              .filter(Boolean)}
                          </div>
                        )}
                      </div>
                    );
                  }).filter(Boolean)
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Menü öğesi bulunamadı
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Toplam:</strong> {visibleMenuItems.length} menü öğesi görünür
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              {menuItems && menuItems.length > 0 ? (
                Object.entries(groupedMenuItems || {}).map(([category, items]) => {
                  if (!category || !items || !Array.isArray(items)) return null;
                  const isExpanded = expandedCategories.has(category);
                  const visibleCount = items.filter(item => item && item.isVisible).length;
                  const totalCount = items.length;
                  
                  return (
                    <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {category}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {visibleCount}/{totalCount}
                        </Badge>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-white dark:bg-gray-900">
                        {items
                          .filter(item => item && item.menuPath) // Filter out invalid items
                          .sort((a, b) => (a?.displayOrder || 0) - (b?.displayOrder || 0))
                          .map((item, index) => {
                            if (!item || !item.menuPath) return null;
                            const canMoveUp = index > 0;
                            const canMoveDown = index < items.length - 1;
                            
                            return (
                              <div
                                key={item.menuPath}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded group"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-move" />
                                <Checkbox
                                  checked={item.isVisible}
                                  onCheckedChange={() => handleToggleVisibility(item.menuPath)}
                                  className="flex-shrink-0"
                                />
                                <div className="flex-1 flex items-center gap-2">
                                  <span className={`text-sm ${item.isVisible ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {item.menuText}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.menuPath}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    #{item.displayOrder}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleMoveItem(item.menuPath, 'up')}
                                    disabled={!canMoveUp}
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleMoveItem(item.menuPath, 'down')}
                                    disabled={!canMoveDown}
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </Button>
                                </div>
                                {item.isVisible ? (
                                  <Eye className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            );
                          })
                          .filter(Boolean)}
                      </div>
                    )}
                  </div>
                );
              }).filter(Boolean)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Menü öğesi bulunamadı. Lütfen bekleyin...
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {previewMode ? (
                <span>{visibleMenuItems.length} menü öğesi görünür</span>
              ) : (
                <span>
                  {menuItems.filter(item => item.isVisible).length} / {menuItems.length} menü öğesi aktif
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setPreviewMode(false);
                }}
                disabled={saving}
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuPermissionManagement;

