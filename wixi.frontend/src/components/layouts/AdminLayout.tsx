import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaTachometerAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUsers,
  FaCog,
  FaChartBar,
  FaEnvelope,
  FaServer,
  FaList,
  FaFileAlt,
  FaChevronRight,
  FaBell,
  FaUserCircle,
  FaChevronLeft,
  FaSun,
  FaMoon,
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaCommentAlt,
  FaNewspaper,
  FaRoute,
  FaHeadset,
  FaQuestionCircle,
  FaClipboardList,
  FaGlobe,
  FaInfoCircle,
  FaFileSignature,
  FaClipboardCheck,
  FaFolderOpen,
  FaCalendarAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaStar,
  FaAward,
  FaTh,
  FaPlus,
  FaEllipsisH,
  FaSearch,
  FaChevronDown,
  FaKey,
  FaShieldAlt
} from 'react-icons/fa';
import authService from '../../ApiServices/services/AuthService';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../contexts/language-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Globe } from 'lucide-react';
import { PreferenceService } from '../../ApiServices/services/PreferenceService';
import { TokenService } from '../../ApiServices/services/TokenService';
import type { ICurrentUser } from '../../ApiServices/types/AuthTypes';
import { isProd } from '../../utils/env';
import { Logger } from '../../utils/logger';
import { menuPermissionService } from '../../ApiServices/services';
import type { MenuPermissionDto } from '../../ApiServices/types/MenuPermissionTypes';

interface MenuItem {
  path: string;
  icon: React.ReactElement;
  text: string;
  badge?: number;
  category?: string;
  isFavorite?: boolean;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
  type?: 'workspace' | 'section' | 'favorites';
  icon?: React.ReactElement;
  isCollapsible?: boolean;
}

interface Workspace {
  id: string;
  name: string;
  icon: React.ReactElement;
  items: MenuItem[];
  isActive?: boolean;
}

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('admin-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({
    'crm': true // CRM workspace açık başlasın
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [userMenuPermissions, setUserMenuPermissions] = useState<MenuPermissionDto[]>([]);
  const [menuPermissionsLoading, setMenuPermissionsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const showPreviewOnlyFeatures = !isProd;

  // Initialize dark mode on mount and sync from user preferences if available
  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      let shouldBeDark = saved ? saved === 'dark' : prefersDark;
      try {
        const token = await TokenService.getInstance().getToken();
        const hasToken = !!token;
        if (hasToken) {
          const pref = await PreferenceService.getMe();
          if (pref?.theme === 'dark' || pref?.theme === 'light') {
            shouldBeDark = pref.theme === 'dark';
          }
        }
      } catch { }
      setIsDark(shouldBeDark);
      const root = document.documentElement;
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    init();
  }, []);

  // Update dark mode when state changes - with debounce to prevent multiple requests
  useEffect(() => {
    const root = document.documentElement;
    // Smooth transition for dark mode
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Debounce server update to prevent multiple rapid requests
    // Clear existing timeout
    const timeoutId = setTimeout(async () => {
      try {
        const token = await TokenService.getInstance().getToken();
        const hasToken = !!token;
        if (hasToken) {
          await PreferenceService.updateMe({ theme: isDark ? 'dark' : 'light' }).catch(() => { });
        }
      } catch { }
    }, 500); // Wait 500ms before updating to server

    // Remove transition after animation completes
    setTimeout(() => {
      root.style.transition = '';
    }, 300);

    // Cleanup timeout on unmount or when isDark changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isDark]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load current user info and menu permissions
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser(true);
        setCurrentUser(user);

        // Load menu permissions for current user
        if (user?.id) {
          setMenuPermissionsLoading(true);
          try {
            const permissions = await menuPermissionService.getMyVisibleMenus();
            setUserMenuPermissions(permissions);
          } catch (error) {
            Logger.error('Error loading menu permissions:', error);
            // If no permissions found, show all menus (fallback)
            setUserMenuPermissions([]);
          } finally {
            setMenuPermissionsLoading(false);
          }
        }
      } catch (error) {
        Logger.error('Error loading user info:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout(true);
      toast({
        variant: 'default',
        title: '✅ Başarılı',
        description: 'Başarıyla çıkış yapıldı'
      });
    } catch (error) {
      Logger.error('Çıkış yapılırken bir hata oluştu:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Çıkış yapılırken bir hata oluştu'
      });
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const handleLanguageChange = async (lang: "de" | "tr" | "en") => {
    setLanguage(lang);
    try {
      const token = await TokenService.getInstance().getToken();
      const hasToken = !!token;
      if (hasToken) {
        await PreferenceService.updateMe({ language: lang });
      }
    } catch (e) {
      // no-op: user may be unauthenticated; UI already updates locally
    }
  };

  // Toggle favorite
  const toggleFavorite = (path: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(path)
        ? prev.filter(f => f !== path)
        : [...prev, path];
      localStorage.setItem('admin-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Get all menu items for favorites
  const getAllMenuItems = useMemo(() => {
    const allItems: MenuItem[] = [];

    // Main
    allItems.push(
      { path: '/admin', icon: <FaTachometerAlt />, text: t('admin.menu.dashboard'), category: t('admin.menu.main') },
      { path: '/admin/reports', icon: <FaChartBar />, text: t('admin.menu.reports'), category: t('admin.menu.main') },
      { path: '/admin/roles', icon: <FaUser />, text: 'Kullanıcılar ve Rol Yönetimi', category: t('admin.menu.main') }
    );

    // Applications
    allItems.push(
      { path: '/admin/employee-submissions', icon: <FaUser />, text: t('admin.menu.employee_submissions'), category: t('admin.menu.applications') },
      { path: '/admin/employer-submissions', icon: <FaBriefcase />, text: t('admin.menu.employer_submissions'), category: t('admin.menu.applications') },
      { path: '/admin/contact-submissions', icon: <FaCommentAlt />, text: t('admin.menu.contact_submissions'), category: t('admin.menu.applications') }
    );

    // Client Management
    allItems.push(
      { path: '/admin/client-tracking', icon: <FaRoute />, text: 'Müşteri Takip', category: 'Müşteri Yönetimi' },
      { path: '/admin/application-templates', icon: <FaClipboardCheck />, text: 'Başvuru Şablonları', category: 'Müşteri Yönetimi' },
      { path: '/admin/document-types', icon: <FaFolderOpen />, text: 'Belge Türleri', category: 'Müşteri Yönetimi' },
      { path: '/admin/document-review', icon: <FaFileSignature />, text: 'Belge İnceleme', category: 'Müşteri Yönetimi' },
      { path: '/admin/support-management', icon: <FaHeadset />, text: 'Destek Yönetimi', category: 'Müşteri Yönetimi' },
      { path: '/admin/faq-management', icon: <FaQuestionCircle />, text: 'SSS Yönetimi', category: 'Müşteri Yönetimi' }
    );

    if (showPreviewOnlyFeatures) {
      allItems.push(
        { path: '/admin/appointments', icon: <FaCalendarAlt />, text: 'Randevu Takvimi', category: 'Randevu Yönetimi' },
        { path: '/admin/appointments-list', icon: <FaList />, text: 'Randevu Listesi', category: 'Randevu Yönetimi' },
        { path: '/admin/payments', icon: <FaCreditCard />, text: 'Ödeme İşlemleri', category: 'Ödeme Yönetimi' }
      );
    }

    // Content Management
    allItems.push(
      { path: '/admin/content-management', icon: <FaFileAlt />, text: 'İçerik Yönetimi', category: 'İçerik Yönetimi' },
      { path: '/admin/testimonials', icon: <FaStar />, text: 'Müşteri Referansları', category: 'İçerik Yönetimi' },
      { path: '/admin/project-references', icon: <FaAward />, text: 'Proje Referansları', category: 'İçerik Yönetimi' }
    );

    // Email Management
    allItems.push(
      { path: '/admin/smtp-settings', icon: <FaServer />, text: t('admin.menu.smtp_settings'), category: t('admin.menu.email_management') },
      { path: '/admin/email-logs', icon: <FaEnvelope />, text: t('admin.menu.email_logs'), category: t('admin.menu.email_management') },
      { path: '/admin/email-templates', icon: <FaFileAlt />, text: t('admin.menu.email_templates'), category: t('admin.menu.email_management') }
    );

    // System
    allItems.push(
      { path: '/admin/team-members', icon: <FaUsers />, text: t('admin.menu.team_members'), category: t('admin.menu.system') },
      { path: '/admin/news', icon: <FaNewspaper />, text: t('admin.menu.news'), category: t('admin.menu.system') },
      { path: '/admin/application-logs', icon: <FaList />, text: t('admin.menu.application_logs'), category: t('admin.menu.system') },
      { path: '/admin/translations', icon: <Globe className="h-4 w-4" />, text: 'Çeviriler', category: t('admin.menu.system') },
      ...(showPreviewOnlyFeatures ? [{ path: '/admin/holidays', icon: <FaCalendarAlt />, text: 'Tatiller', category: t('admin.menu.system') }] : []),
      { path: '/admin/menu-permissions', icon: <FaCog />, text: 'Menü İzinleri', category: t('admin.menu.system') }
    );

    return allItems.map(item => ({
      ...item,
      isFavorite: favorites.includes(item.path)
    }));
  }, [t, showPreviewOnlyFeatures, favorites]);

  // Filter menu items based on user permissions
  const filterMenuItemsByPermissions = useCallback((items: MenuItem[]): MenuItem[] => {
    // If no permissions loaded yet or no permissions exist, show all items (fallback)
    if (menuPermissionsLoading || userMenuPermissions.length === 0) {
      return items;
    }

    // Filter items based on user permissions
    const allowedPaths = new Set(userMenuPermissions.map(p => p.menuPath));
    return items.filter(item => allowedPaths.has(item.path));
  }, [userMenuPermissions, menuPermissionsLoading]);

  // Filter workspaces - remove empty workspaces after filtering
  const filterWorkspaces = useCallback((workspaces: Workspace[]): Workspace[] => {
    return workspaces
      .map(ws => ({
        ...ws,
        items: filterMenuItemsByPermissions(ws.items)
      }))
      .filter(ws => ws.items.length > 0); // Remove empty workspaces
  }, [filterMenuItemsByPermissions]);

  // Bölümler (Workspaces)
  const workspaces: Workspace[] = useMemo(() => {
    const sections: Workspace[] = [
      {
        id: 'main',
        name: t('admin.menu.main'),
        icon: <FaTachometerAlt />,
        isActive: location.pathname.startsWith('/admin') && !location.pathname.includes('/admin/'),
        items: filterMenuItemsByPermissions([
          { path: '/admin', icon: <FaTachometerAlt />, text: t('admin.menu.dashboard'), category: t('admin.menu.main') },
          { path: '/admin/reports', icon: <FaChartBar />, text: t('admin.menu.reports'), category: t('admin.menu.main') },
          { path: '/admin/roles', icon: <FaUser />, text: t('admin.menu.users_roles'), category: t('admin.menu.main') },
          { path: '/admin/settings', icon: <FaCog />, text: 'Ayarlar', category: t('admin.menu.main') },
        ])
      },
      /* DISABLED FOR TEKSTIL PROJECT - Applications */
      /* {
        id: 'applications',
        name: t('admin.menu.applications'),
        icon: <FaClipboardList />,
        isActive: location.pathname.includes('/admin/employee-submissions') || 
                  location.pathname.includes('/admin/employer-submissions') || 
                  location.pathname.includes('/admin/contact-submissions'),
        items: filterMenuItemsByPermissions([
          { path: '/admin/employee-submissions', icon: <FaUser />, text: t('admin.menu.employee_submissions'), category: t('admin.menu.applications') },
          { path: '/admin/employer-submissions', icon: <FaBriefcase />, text: t('admin.menu.employer_submissions'), category: t('admin.menu.applications') },
          { path: '/admin/contact-submissions', icon: <FaCommentAlt />, text: t('admin.menu.contact_submissions'), category: t('admin.menu.applications') },
        ])
      }, */
      /* DISABLED FOR TEKSTIL PROJECT - Client Management */
      /* {
        id: 'client-management',
        name: t('admin.menu.customer_management'),
        icon: <FaRoute />,
        isActive: location.pathname.includes('/admin/client-tracking') || 
                  location.pathname.includes('/admin/application-templates') || 
                  location.pathname.includes('/admin/document-types') || 
                  location.pathname.includes('/admin/document-review') || 
                  location.pathname.includes('/admin/support-management') || 
                  location.pathname.includes('/admin/faq-management'),
        items: filterMenuItemsByPermissions([
          { path: '/admin/client-tracking', icon: <FaRoute />, text: t('admin.menu.customer_tracking'), category: t('admin.menu.customer_management') },
          { path: '/admin/application-templates', icon: <FaClipboardCheck />, text: t('admin.menu.application_templates'), category: t('admin.menu.customer_management') },
          { path: '/admin/document-types', icon: <FaFolderOpen />, text: t('admin.menu.document_types'), category: t('admin.menu.customer_management') },
          { path: '/admin/document-review', icon: <FaFileSignature />, text: t('admin.menu.document_review'), category: t('admin.menu.customer_management') },
          { path: '/admin/support-management', icon: <FaHeadset />, text: t('admin.menu.support_management'), category: t('admin.menu.customer_management') },
          { path: '/admin/faq-management', icon: <FaQuestionCircle />, text: t('admin.menu.faq_management'), category: t('admin.menu.customer_management') },
        ])
      }, */
      {
        id: 'tekstil',
        name: 'Tekstil Yönetimi',
        icon: <FaGlobe />,
        isActive: location.pathname.includes('/admin/tekstil'),
        items: filterMenuItemsByPermissions([
          { path: '/admin/tekstil/languages', icon: <FaGlobe />, text: 'Diller', category: 'Tekstil Yönetimi' },
          { path: '/admin/tekstil/about', icon: <FaInfoCircle />, text: 'Hakkımızda', category: 'Tekstil Yönetimi' },
          { path: '/admin/tekstil/stats', icon: <FaChartBar />, text: 'İstatistikler', category: 'Tekstil Yönetimi' },
          { path: '/admin/tekstil/product-categories', icon: <FaFolderOpen />, text: 'Ürün Kategorileri', category: 'Tekstil Yönetimi' },
          { path: '/admin/tekstil/products', icon: <FaTh />, text: 'Ürünler', category: 'Tekstil Yönetimi' },
          { path: '/admin/tekstil/project-categories', icon: <FaFolderOpen />, text: 'Proje Kategorileri', category: 'Tekstil Yönetimi' },
          { path: '/admin/tekstil/projects', icon: <FaAward />, text: 'Projeler', category: 'Tekstil Yönetimi' },
          { path: '/admin/tekstil/contact-submissions', icon: <FaCommentAlt />, text: 'İletişim Formları', category: 'Tekstil Yönetimi' },
          { path: '/admin/tekstil/contact-info', icon: <FaHeadset />, text: 'İletişim Bilgileri', category: 'Tekstil Yönetimi' },
        ])
      },
    ];

    if (showPreviewOnlyFeatures) {
      sections.push({
        id: 'appointments',
        name: t('admin.menu.appointment_management'),
        icon: <FaCalendarAlt />,
        isActive: location.pathname.includes('/admin/appointments'),
        items: filterMenuItemsByPermissions([
          { path: '/admin/appointments', icon: <FaCalendarAlt />, text: t('admin.menu.appointment_calendar'), category: t('admin.menu.appointment_management') },
          { path: '/admin/appointments-list', icon: <FaList />, text: t('admin.menu.appointment_list'), category: t('admin.menu.appointment_management') },
        ])
      });
      sections.push({
        id: 'payments',
        name: t('admin.menu.payment_management'),
        icon: <FaCreditCard />,
        isActive: location.pathname.includes('/admin/payments'),
        items: filterMenuItemsByPermissions([
          { path: '/admin/payments', icon: <FaCreditCard />, text: t('admin.menu.payment_operations'), category: t('admin.menu.payment_management') },
        ])
      });
    }

    /* DISABLED FOR TEKSTIL PROJECT - Content Management */
    /* sections.push({
      id: 'content',
      name: t('admin.menu.content_management'),
      icon: <FaFileAlt />,
      isActive: location.pathname.includes('/admin/content-management') || location.pathname.includes('/admin/testimonials') || location.pathname.includes('/admin/project-references') || location.pathname.includes('/admin/equivalency-fee-settings'),
      items: filterMenuItemsByPermissions([
        { path: '/admin/content-management', icon: <FaFileAlt />, text: t('admin.menu.content_management'), category: t('admin.menu.content_management') },
        { path: '/admin/testimonials', icon: <FaStar />, text: 'Müşteri Referansları', category: t('admin.menu.content_management') },
        { path: '/admin/project-references', icon: <FaAward />, text: 'Proje Referansları', category: t('admin.menu.content_management') },
        { path: '/admin/equivalency-fee-settings', icon: <FaCreditCard />, text: 'Denklik Ücreti Ayarları', category: t('admin.menu.content_management') },
      ])
    }); */

    sections.push({
      id: 'email',
      name: t('admin.menu.email_management'),
      icon: <FaEnvelope />,
      isActive: location.pathname.includes('/admin/smtp-settings') ||
        location.pathname.includes('/admin/email-logs') ||
        location.pathname.includes('/admin/email-templates'),
      items: filterMenuItemsByPermissions([
        { path: '/admin/smtp-settings', icon: <FaServer />, text: t('admin.menu.smtp_settings'), category: t('admin.menu.email_management') },
        { path: '/admin/email-logs', icon: <FaEnvelope />, text: t('admin.menu.email_logs'), category: t('admin.menu.email_management') },
        { path: '/admin/email-templates', icon: <FaFileAlt />, text: t('admin.menu.email_templates'), category: t('admin.menu.email_management') },
      ])
    });

    sections.push({
      id: 'system',
      name: t('admin.menu.system'),
      icon: <FaCog />,
      isActive: location.pathname.includes('/admin/team-members') ||
        location.pathname.includes('/admin/news') ||
        location.pathname.includes('/admin/application-logs') ||
        location.pathname.includes('/admin/translations') ||
        (showPreviewOnlyFeatures && location.pathname.includes('/admin/holidays')) ||
        location.pathname.includes('/admin/menu-permissions') ||
        location.pathname.includes('/admin/license-key'),
      items: filterMenuItemsByPermissions([
        { path: '/admin/team-members', icon: <FaUsers />, text: t('admin.menu.team_members'), category: t('admin.menu.system') },
        { path: '/admin/news', icon: <FaNewspaper />, text: t('admin.menu.news'), category: t('admin.menu.system') },
        { path: '/admin/application-logs', icon: <FaList />, text: t('admin.menu.application_logs'), category: t('admin.menu.system') },
        { path: '/admin/translations', icon: <Globe className="h-4 w-4" />, text: t('admin.menu.translations'), category: t('admin.menu.system') },
        ...(showPreviewOnlyFeatures ? [{ path: '/admin/holidays', icon: <FaCalendarAlt />, text: t('admin.menu.holidays'), category: t('admin.menu.system') }] : []),
        { path: '/admin/menu-permissions', icon: <FaCog />, text: t('admin.menu.menu_permissions'), category: t('admin.menu.system') },
        { path: '/admin/license-key', icon: <FaKey />, text: 'Lisans Yönetimi', category: t('admin.menu.system') },
      ])
    });

    return filterWorkspaces(sections);
  }, [t, showPreviewOnlyFeatures, location.pathname, filterMenuItemsByPermissions, filterWorkspaces]);

  // Top level sections (like Monday.com) - removed, all items are in workspaces now
  const topSections: MenuCategory[] = useMemo(() => [], []);

  // Filter menu items by search query
  const filterMenuItemsBySearch = useCallback((items: MenuItem[]): MenuItem[] => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.text.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Filter workspaces by search
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces;
    return workspaces
      .map(ws => ({
        ...ws,
        items: filterMenuItemsBySearch(ws.items)
      }))
      .filter(ws => ws.items.length > 0);
  }, [workspaces, searchQuery, filterMenuItemsBySearch]);

  // Auto-expand workspaces when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const workspacesToExpand: Record<string, boolean> = {};
      filteredWorkspaces.forEach(ws => {
        if (ws.items.length > 0) {
          workspacesToExpand[ws.id] = true;
        }
      });
      setExpandedWorkspaces(prev => ({
        ...prev,
        ...workspacesToExpand
      }));
    }
  }, [searchQuery, filteredWorkspaces]);

  // Menu structure (Monday.com style)
  const menuStructure = useMemo(() => {
    const favoritesItems = filterMenuItemsBySearch(getAllMenuItems.filter(item => item.isFavorite));

    return {
      topSections: searchQuery.trim() ? [] : topSections, // Hide top sections when searching
      favorites: favoritesItems.length > 0 ? {
        name: 'Favoriler',
        type: 'favorites' as const,
        icon: <FaStar />,
        items: favoritesItems
      } : null,
      workspaces: filteredWorkspaces
    };
  }, [topSections, getAllMenuItems, filteredWorkspaces, searchQuery, filterMenuItemsBySearch]);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    // Exact match for paths that could conflict (e.g., /admin/appointments and /admin/appointments-list)
    const exactMatchPaths = ['/admin/appointments', '/admin/appointments-list'];
    if (exactMatchPaths.includes(path)) {
      return location.pathname === path;
    }
    // For other paths, use startsWith but ensure we don't match sub-paths incorrectly
    if (location.pathname === path) {
      return true;
    }
    // Only use startsWith if path ends with a slash or if the next character after path is a slash
    return location.pathname.startsWith(path + '/');
  };

  // Page title mapping
  const getPageTitle = useCallback((pathname: string): string => {
    const pathMap: Record<string, string> = {
      '/admin': t('admin.title.dashboard'),
      '/admin/users': t('admin.title.users'),
      '/admin/reports': t('admin.title.reports'),
      '/admin/settings': t('admin.title.settings'),
      '/admin/smtp-settings': t('admin.title.smtp_settings'),
      '/admin/email-logs': t('admin.title.email_logs'),
      '/admin/email-templates': t('admin.title.email_templates'),
      '/admin/application-logs': t('admin.title.application_logs'),
      '/admin/employee-submissions': t('admin.title.employee_submissions'),
      '/admin/employer-submissions': t('admin.title.employer_submissions'),
      '/admin/employer-submissions-v2': t('admin.title.employer_submissions_v2'),
      '/admin/contact-submissions': t('admin.title.contact_submissions'),
      '/admin/team-members': t('admin.title.team_members'),
      '/admin/news': t('admin.title.news'),
      '/admin/translations': 'Çeviri Yönetimi',
      '/admin/client-tracking': 'Müşteri Takip',
      '/admin/support-management': 'Destek Yönetimi',
      '/admin/faq-management': 'SSS Yönetimi',
      '/admin/application-management': 'Başvuru Yönetimi',
      '/admin/application-templates': 'Başvuru Şablonları',
      '/admin/document-types': 'Belge Türleri',
      '/admin/document-review': 'Belge İnceleme',
      '/admin/appointments': 'Randevu Takvimi',
      '/admin/roles': 'Kullanıcılar ve Rol Yönetimi',
      '/admin/appointments-list': 'Randevu Listesi',
      '/admin/holidays': 'Tatil Yönetimi',
      '/admin/payments': 'Ödeme'
    };
    return pathMap[pathname] || 'Admin Panel';
  }, [t]);

  // Breadcrumb generator
  const getBreadcrumbs = useCallback((): Array<{ label: string; path?: string }> => {
    if (location.pathname === '/admin') {
      return [{ label: t('admin.breadcrumb.dashboard') }];
    }

    const crumbs: Array<{ label: string; path?: string }> = [{ label: t('admin.breadcrumb.dashboard'), path: '/admin' }];
    const pathParts = location.pathname.split('/').filter(Boolean);
    let currentPath = '';

    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;

      if (part === 'admin') return;

      const title = getPageTitle(currentPath);
      if (index === pathParts.length - 1) {
        crumbs.push({ label: title });
      } else {
        crumbs.push({ label: title, path: currentPath });
      }
    });

    return crumbs;
  }, [t, location.pathname, getPageTitle]);

  const sidebarWidth = isSidebarOpen ? '280px' : '80px';
  const pageTitle = getPageTitle(location.pathname);
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 ease-in-out z-50 flex flex-col ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
          }`}
        style={{ width: sidebarWidth }}
      >
        {/* Logo/Header */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 dark:from-purple-700 dark:via-violet-700 dark:to-fuchsia-700 transition-all duration-300">
          {isSidebarOpen && (
            <Link to="/admin" className="flex items-center gap-3">
              <img
                src="/worklines-logo.jpeg"
                alt="Worklines Logo"
                className="h-10 w-auto rounded-lg shadow-lg bg-white p-1 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Worklines</h1>
                <p className="text-xs text-purple-100">Admin Panel</p>
              </div>
            </Link>
          )}
          {!isSidebarOpen && (
            <div className="w-full flex justify-center">
              <img
                src="/worklines-logo.jpeg"
                alt="Worklines Logo"
                className="h-10 w-auto rounded-lg shadow-lg bg-white p-1 object-contain"
              />
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 text-white"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation - Monday.com Style */}
        <nav
          className="flex-1 overflow-y-auto py-4 px-2 transition-colors duration-300"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          } as React.CSSProperties}
        >
          <style>{`
            aside nav::-webkit-scrollbar {
              display: none;
              width: 0;
              height: 0;
            }
          `}</style>
          {/* Top Sections */}
          {isSidebarOpen && menuStructure.topSections.length > 0 && (
            <div className="mb-4">
              {menuStructure.topSections.map((section, idx) => (
                <div key={idx} className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.name}
                  </div>
                  <ul className="space-y-0.5">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link
                          to={item.path}
                          onClick={() => isMobile && setIsSidebarOpen(false)}
                          className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 text-sm ${isActive(item.path)
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                          <span className={`text-sm flex-shrink-0 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {item.icon}
                          </span>
                          {isSidebarOpen && (
                            <span className="flex-1 truncate">{item.text}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Favorites Section */}
          {isSidebarOpen && menuStructure.favorites && menuStructure.favorites.items.length > 0 && (
            <div className="mb-4 border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <FaStar className="text-xs" />
                <span>Favoriler</span>
              </div>
              <ul className="space-y-0.5">
                {menuStructure.favorites.items.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 text-sm ${isActive(item.path)
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <span className={`text-sm flex-shrink-0 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.icon}
                      </span>
                      {isSidebarOpen && (
                        <>
                          <span className="flex-1 truncate">{item.text}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(item.path);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <FaStar className={`text-xs ${item.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`} />
                          </button>
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bölümler Section */}
          {isSidebarOpen && (
            <div className="mb-4 border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaTh className="text-xs" />
                  <span>Bölümler</span>
                </div>
                <div className="flex items-center gap-1">
                  {isSearchOpen ? (
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded px-2 py-1">
                      <FaSearch className="text-xs text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ara..."
                        className="text-xs bg-transparent border-none outline-none w-24 text-gray-700 dark:text-gray-300"
                        autoFocus
                        onBlur={() => {
                          if (!searchQuery.trim()) {
                            setIsSearchOpen(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setSearchQuery('');
                            setIsSearchOpen(false);
                          }
                        }}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchOpen(false);
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <FaSearch className="text-xs" />
                    </button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <FaEllipsisH className="text-xs" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          const allExpanded = menuStructure.workspaces.every(ws => expandedWorkspaces[ws.id]);
                          const newState: Record<string, boolean> = {};
                          menuStructure.workspaces.forEach(ws => {
                            newState[ws.id] = !allExpanded;
                          });
                          setExpandedWorkspaces(newState);
                        }}
                        className="cursor-pointer"
                      >
                        <FaChevronDown className="w-4 h-4 mr-2" />
                        {menuStructure.workspaces.every(ws => expandedWorkspaces[ws.id]) ? 'Tümünü Kapat' : 'Tümünü Aç'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (favorites.length > 0) {
                            setFavorites([]);
                            localStorage.setItem('admin-favorites', JSON.stringify([]));
                            toast({
                              title: 'Başarılı',
                              description: 'Tüm favoriler kaldırıldı.',
                            });
                          } else {
                            toast({
                              title: 'Bilgi',
                              description: 'Kaldırılacak favori bulunamadı.',
                            });
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <FaStar className="w-4 h-4 mr-2" />
                        Favorileri Kaldır
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {menuStructure.workspaces.map((workspace) => {
                const isExpanded = expandedWorkspaces[workspace.id] ?? false;
                const hasActiveItem = workspace.items.some(item => isActive(item.path));

                return (
                  <div key={workspace.id} className="mb-1">
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${workspace.isActive || hasActiveItem
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <div
                        className="flex items-center gap-2.5 flex-1 cursor-pointer"
                        onClick={() => setExpandedWorkspaces(prev => ({
                          ...prev,
                          [workspace.id]: !isExpanded
                        }))}
                      >
                        <span className={`text-sm ${workspace.isActive || hasActiveItem ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {workspace.icon}
                        </span>
                        {isSidebarOpen && (
                          <>
                            <span className={`flex-1 text-sm font-medium truncate ${workspace.isActive || hasActiveItem
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300'
                              }`}>
                              {workspace.name}
                            </span>
                            <FaChevronDown
                              className={`text-xs text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                }`}
                            />
                          </>
                        )}
                      </div>
                      {isSidebarOpen && (
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100">
                            <FaPlus className="text-xs text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    {isExpanded && isSidebarOpen && (
                      <ul className="ml-8 mt-1 space-y-0.5">
                        {workspace.items.map((item, idx) => (
                          <li key={idx}>
                            <Link
                              to={item.path}
                              onClick={() => isMobile && setIsSidebarOpen(false)}
                              className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 text-sm ${isActive(item.path)
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                              <span className={`text-sm flex-shrink-0 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {item.icon}
                              </span>
                              <span className="flex-1 truncate">{item.text}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(item.path);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              >
                                <FaStar className={`text-xs ${item.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`} />
                              </button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Collapsed Sidebar - Show only icons */}
          {!isSidebarOpen && (
            <div className="space-y-2">
              {menuStructure.workspaces.map((workspace) => (
                <div key={workspace.id} className="flex flex-col items-center">
                  <Link
                    to={workspace.items[0]?.path || '/admin'}
                    className={`p-3 rounded-lg transition-all duration-200 ${workspace.isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    title={workspace.name}
                  >
                    {workspace.icon}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </nav>

      </aside>

      {/* Main Content */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: isMobile ? '0' : sidebarWidth }}
      >
        {/* Top Bar */}
        <header className="bg-white/70 dark:bg-gray-950/70 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
          {/* Header Content */}
          <div className="h-16 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300"
              >
                <FaBars className="text-xl" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 dark:from-purple-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent transition-all duration-300">
                  {pageTitle}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-300 text-sm font-medium h-auto"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{language === "de" ? "DE" : language === "tr" ? "TR" : "EN"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange("de")}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🇩🇪 Deutsch
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange("tr")}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🇹🇷 Türkçe
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange("en")}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🇬🇧 English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                title={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              >
                {isDark ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
                <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
              </button>
              {/* Notification Button */}
              <button
                className="relative flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-300"
                title="Bildirimler"
              >
                <FaBell className="text-lg" />
                {/* Badge can be added here if needed */}
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-300 text-sm font-medium"
              >
                <FaHome className="text-lg" />
                <span className="hidden sm:inline">Ana Sayfa</span>
              </Link>

              {/* User Profile & Logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 dark:from-purple-600 dark:via-violet-600 dark:to-fuchsia-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md">
                      {currentUser ? (
                        `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase() || 'A'
                      ) : (
                        <FaUserCircle className="text-lg" />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email : 'Admin'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentUser?.roles?.length > 0 ? currentUser.roles[0] : 'Yönetici'}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-48">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email : 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser?.email || ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {currentUser?.roles?.length > 0 ? currentUser.roles.join(', ') : 'Yönetici'}
                    </p>
                  </div>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Breadcrumb - Below Title */}
          <div className="px-4 lg:px-8 pb-3 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <FaChevronRight className="text-[10px] text-gray-400 dark:text-gray-500" />
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-5rem)] w-full px-2.5 lg:px-4 py-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
