import React, { useEffect, useState } from 'react';
import { 
  FaUsers, 
  FaChartLine, 
  FaFire, 
  FaCheckCircle, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaCreditCard,
  FaMoneyBillWave,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import authService from '../../ApiServices/services/AuthService';
import type { ICurrentUser } from '../../ApiServices/types/AuthTypes';
import { API_ROUTES } from '../../ApiServices/config/api.config';
import { TokenService } from '../../ApiServices/services/TokenService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

interface DashboardStats {
  users: {
    total: number;
    active: number;
  };
  formSubmissions: {
    total: number;
    employees: number;
    employers: number;
    contact: number;
    today: number;
  };
  emails: {
    total: number;
    sent: number;
    failed: number;
  };
  appointments?: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    today: number;
    upcoming: number;
    past: number;
  };
  payments?: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    cancelled: number;
    refunded: number;
    totalRevenue: number;
    today: number;
    todayRevenue: number;
  };
  charts?: {
    appointmentsLast30Days: Array<{ date: string; count: number }>;
    paymentsLast30Days: Array<{ date: string; count: number; revenue: number }>;
  };
  systemStatus: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Dashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
    loadDashboardStats();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser(true);
      setCurrentUser(user);
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const token = await TokenService.getInstance().getToken(true);
      if (!token) {
        setStatsLoading(false);
        return;
      }

      const response = await fetch(API_ROUTES.ADMIN.DASHBOARD_STATS, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenemedi:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const statCards: StatCard[] = stats ? [
    {
      title: 'Toplam Kullanıcılar',
      value: stats.users.total,
      icon: <FaUsers className="text-4xl" />,
      color: 'bg-blue-500 dark:bg-blue-600',
      subtitle: `${stats.users.active} aktif`
    },
    {
      title: 'Toplam Randevular',
      value: stats.appointments?.total || 0,
      icon: <FaCalendarAlt className="text-4xl" />,
      color: 'bg-purple-500 dark:bg-purple-600',
      subtitle: `${stats.appointments?.upcoming || 0} yaklaşan`
    },
    {
      title: 'Toplam Ödemeler',
      value: stats.payments?.total || 0,
      icon: <FaCreditCard className="text-4xl" />,
      color: 'bg-green-500 dark:bg-green-600',
      subtitle: formatCurrency(stats.payments?.totalRevenue || 0)
    },
    {
      title: 'Toplam Form Başvuruları',
      value: stats.formSubmissions.total,
      icon: <FaFileAlt className="text-4xl" />,
      color: 'bg-yellow-500 dark:bg-yellow-600',
      subtitle: `${stats.formSubmissions.today} bugün`
    }
  ] : [];

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const appointmentStatusData = stats?.appointments ? [
    { name: 'Onaylandı', value: stats.appointments.confirmed, color: '#10B981' },
    { name: 'Beklemede', value: stats.appointments.pending, color: '#F59E0B' },
    { name: 'Tamamlandı', value: stats.appointments.completed, color: '#3B82F6' },
    { name: 'İptal Edildi', value: stats.appointments.cancelled, color: '#EF4444' }
  ].filter(item => item.value > 0) : [];

  const paymentStatusData = stats?.payments ? [
    { name: 'Tamamlandı', value: stats.payments.completed, color: '#10B981' },
    { name: 'Beklemede', value: stats.payments.pending, color: '#F59E0B' },
    { name: 'Başarısız', value: stats.payments.failed, color: '#EF4444' },
    { name: 'İptal Edildi', value: stats.payments.cancelled, color: '#8B5CF6' },
    { name: 'İade Edildi', value: stats.payments.refunded, color: '#EC4899' }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">
          Hoş Geldiniz, {currentUser?.firstName} {currentUser?.lastName}!
        </h1>
        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Worklines ProConsulting Admin Paneli
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={`${stat.color} text-white p-4 rounded-lg transition-colors duration-300`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Randevular - Son 30 Gün</CardTitle>
            <CardDescription>Günlük randevu oluşturma trendi</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.charts?.appointmentsLast30Days || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('tr-TR');
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Randevu Sayısı"
                  dot={{ fill: '#8B5CF6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payments Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ödeme Gelirleri - Son 30 Gün</CardTitle>
            <CardDescription>Günlük ödeme gelir trendi</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.charts?.paymentsLast30Days || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('tr-TR');
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" name="Gelir (EUR)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Randevu Durumları</CardTitle>
            <CardDescription>Randevuların durum dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {appointmentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${typeof percent === 'number' ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Henüz randevu verisi yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ödeme Durumları</CardTitle>
            <CardDescription>Ödemelerin durum dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {paymentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${typeof percent === 'number' ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Henüz ödeme verisi yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Appointments Details */}
        {stats?.appointments && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaCalendarAlt className="text-purple-500" />
                Randevu Detayları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bugün:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {stats.appointments.today}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Yaklaşan:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {stats.appointments.upcoming}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Geçmiş:</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {stats.appointments.past}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Onaylandı:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {stats.appointments.confirmed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Beklemede:</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {stats.appointments.pending}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments Details */}
        {stats?.payments && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaCreditCard className="text-green-500" />
                Ödeme Detayları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Toplam Gelir:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.payments.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bugün:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {stats.payments.today} ödeme
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bugünkü Gelir:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.payments.todayRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tamamlandı:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {stats.payments.completed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Beklemede:</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {stats.payments.pending}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Submissions */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaFileAlt className="text-yellow-500" />
                Form Başvuruları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Çalışan:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {stats.formSubmissions.employees}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">İşveren:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {stats.formSubmissions.employers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">İletişim:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {stats.formSubmissions.contact}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bugün:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {stats.formSubmissions.today}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors duration-300">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-32 transition-colors duration-300">ID:</span>
              <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{currentUser?.id}</span>
            </div>
            <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors duration-300">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-32 transition-colors duration-300">Ad Soyad:</span>
              <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
            </div>
            <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors duration-300">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-32 transition-colors duration-300">E-posta:</span>
              <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{currentUser?.email}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-32 transition-colors duration-300">Roller:</span>
              <div className="flex gap-2">
                {currentUser?.roles.map((role, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium transition-colors duration-300"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
