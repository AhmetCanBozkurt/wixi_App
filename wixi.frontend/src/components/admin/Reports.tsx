import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaDownload, 
  FaCalendar, 
  FaUsers, 
  FaFileAlt, 
  FaEnvelope,
  FaCreditCard,
  FaCalendarAlt
} from 'react-icons/fa';
import { API_ROUTES } from '../../ApiServices/config/api.config';
import { TokenService } from '../../ApiServices/services/TokenService';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ReportData {
  dashboard?: {
    users: { total: number; active: number };
    formSubmissions: { total: number; employees: number; employers: number; contact: number };
    emails: { total: number; sent: number; failed: number };
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
  };
  users?: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminCount: number;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const token = await TokenService.getInstance().getToken(true);
      if (!token) {
        setLoading(false);
        return;
      }

      const [dashboardRes, usersRes] = await Promise.all([
        fetch(API_ROUTES.ADMIN.DASHBOARD_STATS, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch(API_ROUTES.ADMIN.USERS_STATS, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
      ]);

      const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;
      const usersData = usersRes.ok ? await usersRes.json() : null;

      setReportData({
        dashboard: dashboardData,
        users: usersData
      });
    } catch (error) {
      console.error('Rapor verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const prepareReportData = () => {
    const reportDate = new Date().toLocaleDateString('tr-TR');
    
    const data: any = {
      raporTarihi: reportDate,
      kullaniciIstatistikleri: {
        toplamKullanici: reportData.users?.totalUsers || 0,
        aktifKullanici: reportData.users?.activeUsers || 0,
        pasifKullanici: reportData.users?.inactiveUsers || 0,
        adminSayisi: reportData.users?.adminCount || 0
      },
      formBasvurulari: {
        toplam: reportData.dashboard?.formSubmissions?.total || 0,
        calisanBasvurulari: reportData.dashboard?.formSubmissions?.employees || 0,
        isverenTalepleri: reportData.dashboard?.formSubmissions?.employers || 0,
        iletisimFormu: reportData.dashboard?.formSubmissions?.contact || 0
      },
      emailIstatistikleri: {
        toplam: reportData.dashboard?.emails?.total || 0,
        gonderildi: reportData.dashboard?.emails?.sent || 0,
        hatali: reportData.dashboard?.emails?.failed || 0
      }
    };

    if (reportData.dashboard?.appointments) {
      data.randevuIstatistikleri = {
        toplam: reportData.dashboard.appointments.total,
        beklemede: reportData.dashboard.appointments.pending,
        onaylandi: reportData.dashboard.appointments.confirmed,
        tamamlandi: reportData.dashboard.appointments.completed,
        iptalEdildi: reportData.dashboard.appointments.cancelled,
        bugun: reportData.dashboard.appointments.today,
        yaklasan: reportData.dashboard.appointments.upcoming,
        gecmis: reportData.dashboard.appointments.past
      };
    }

    if (reportData.dashboard?.payments) {
      data.odemeIstatistikleri = {
        toplam: reportData.dashboard.payments.total,
        tamamlandi: reportData.dashboard.payments.completed,
        beklemede: reportData.dashboard.payments.pending,
        basarisiz: reportData.dashboard.payments.failed,
        iptalEdildi: reportData.dashboard.payments.cancelled,
        iadeEdildi: reportData.dashboard.payments.refunded,
        toplamGelir: reportData.dashboard.payments.totalRevenue,
        bugunkuGelir: reportData.dashboard.payments.todayRevenue,
        bugunkuOdemeSayisi: reportData.dashboard.payments.today
      };
    }

    return data;
  };

  const handleDownloadReport = (format: 'csv' | 'excel' | 'json') => {
    try {
      const data = prepareReportData();
      const dateStr = new Date().toISOString().split('T')[0];
      
      if (format === 'json') {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `rapor_${dateStr}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (format === 'csv') {
        const csvRows: string[] = [];
        csvRows.push('Rapor Tarihi,' + data.raporTarihi);
        csvRows.push('');
        csvRows.push('KULLANICI İSTATİSTİKLERİ');
        csvRows.push('Toplam Kullanıcı,' + data.kullaniciIstatistikleri.toplamKullanici);
        csvRows.push('Aktif Kullanıcı,' + data.kullaniciIstatistikleri.aktifKullanici);
        csvRows.push('Pasif Kullanıcı,' + data.kullaniciIstatistikleri.pasifKullanici);
        csvRows.push('Admin Sayısı,' + data.kullaniciIstatistikleri.adminSayisi);
        csvRows.push('');
        csvRows.push('FORM BAŞVURULARI');
        csvRows.push('Toplam,' + data.formBasvurulari.toplam);
        csvRows.push('Çalışan Başvuruları,' + data.formBasvurulari.calisanBasvurulari);
        csvRows.push('İşveren Talepleri,' + data.formBasvurulari.isverenTalepleri);
        csvRows.push('İletişim Formu,' + data.formBasvurulari.iletisimFormu);
        csvRows.push('');
        csvRows.push('EMAIL İSTATİSTİKLERİ');
        csvRows.push('Toplam,' + data.emailIstatistikleri.toplam);
        csvRows.push('Gönderildi,' + data.emailIstatistikleri.gonderildi);
        csvRows.push('Hatalı,' + data.emailIstatistikleri.hatali);
        csvRows.push('');
        
        if (data.randevuIstatistikleri) {
          csvRows.push('RANDEVU İSTATİSTİKLERİ');
          csvRows.push('Toplam,' + data.randevuIstatistikleri.toplam);
          csvRows.push('Beklemede,' + data.randevuIstatistikleri.beklemede);
          csvRows.push('Onaylandı,' + data.randevuIstatistikleri.onaylandi);
          csvRows.push('Tamamlandı,' + data.randevuIstatistikleri.tamamlandi);
          csvRows.push('İptal Edildi,' + data.randevuIstatistikleri.iptalEdildi);
          csvRows.push('Bugün,' + data.randevuIstatistikleri.bugun);
          csvRows.push('Yaklaşan,' + data.randevuIstatistikleri.yaklasan);
          csvRows.push('Geçmiş,' + data.randevuIstatistikleri.gecmis);
          csvRows.push('');
        }
        
        if (data.odemeIstatistikleri) {
          csvRows.push('ÖDEME İSTATİSTİKLERİ');
          csvRows.push('Toplam,' + data.odemeIstatistikleri.toplam);
          csvRows.push('Tamamlandı,' + data.odemeIstatistikleri.tamamlandi);
          csvRows.push('Beklemede,' + data.odemeIstatistikleri.beklemede);
          csvRows.push('Başarısız,' + data.odemeIstatistikleri.basarisiz);
          csvRows.push('İptal Edildi,' + data.odemeIstatistikleri.iptalEdildi);
          csvRows.push('İade Edildi,' + data.odemeIstatistikleri.iadeEdildi);
          csvRows.push('Toplam Gelir (EUR),' + data.odemeIstatistikleri.toplamGelir);
          csvRows.push('Bugünkü Gelir (EUR),' + data.odemeIstatistikleri.bugunkuGelir);
          csvRows.push('Bugünkü Ödeme Sayısı,' + data.odemeIstatistikleri.bugunkuOdemeSayisi);
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `rapor_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (format === 'excel') {
        // Dynamic import for xlsx to avoid build issues
        (async () => {
          try {
            const XLSX = await import('xlsx');
            // Prepare data for Excel
            const workbook = XLSX.utils.book_new();
            
            // Summary sheet
            const summaryData = [
              ['Rapor Tarihi', data.raporTarihi],
              [''],
              ['KULLANICI İSTATİSTİKLERİ', ''],
              ['Toplam Kullanıcı', data.kullaniciIstatistikleri.toplamKullanici],
              ['Aktif Kullanıcı', data.kullaniciIstatistikleri.aktifKullanici],
              ['Pasif Kullanıcı', data.kullaniciIstatistikleri.pasifKullanici],
              ['Admin Sayısı', data.kullaniciIstatistikleri.adminSayisi],
              [''],
              ['FORM BAŞVURULARI', ''],
              ['Toplam', data.formBasvurulari.toplam],
              ['Çalışan Başvuruları', data.formBasvurulari.calisanBasvurulari],
              ['İşveren Talepleri', data.formBasvurulari.isverenTalepleri],
              ['İletişim Formu', data.formBasvurulari.iletisimFormu],
              [''],
              ['EMAIL İSTATİSTİKLERİ', ''],
              ['Toplam', data.emailIstatistikleri.toplam],
              ['Gönderildi', data.emailIstatistikleri.gonderildi],
              ['Hatalı', data.emailIstatistikleri.hatali],
            ];

            if (data.randevuIstatistikleri) {
              summaryData.push([''], ['RANDEVU İSTATİSTİKLERİ', '']);
              summaryData.push(['Toplam', data.randevuIstatistikleri.toplam]);
              summaryData.push(['Beklemede', data.randevuIstatistikleri.beklemede]);
              summaryData.push(['Onaylandı', data.randevuIstatistikleri.onaylandi]);
              summaryData.push(['Tamamlandı', data.randevuIstatistikleri.tamamlandi]);
              summaryData.push(['İptal Edildi', data.randevuIstatistikleri.iptalEdildi]);
              summaryData.push(['Bugün', data.randevuIstatistikleri.bugun]);
              summaryData.push(['Yaklaşan', data.randevuIstatistikleri.yaklasan]);
              summaryData.push(['Geçmiş', data.randevuIstatistikleri.gecmis]);
            }

            if (data.odemeIstatistikleri) {
              summaryData.push([''], ['ÖDEME İSTATİSTİKLERİ', '']);
              summaryData.push(['Toplam', data.odemeIstatistikleri.toplam]);
              summaryData.push(['Tamamlandı', data.odemeIstatistikleri.tamamlandi]);
              summaryData.push(['Beklemede', data.odemeIstatistikleri.beklemede]);
              summaryData.push(['Başarısız', data.odemeIstatistikleri.basarisiz]);
              summaryData.push(['İptal Edildi', data.odemeIstatistikleri.iptalEdildi]);
              summaryData.push(['İade Edildi', data.odemeIstatistikleri.iadeEdildi]);
              summaryData.push(['Toplam Gelir (EUR)', data.odemeIstatistikleri.toplamGelir]);
              summaryData.push(['Bugünkü Gelir (EUR)', data.odemeIstatistikleri.bugunkuGelir]);
              summaryData.push(['Bugünkü Ödeme Sayısı', data.odemeIstatistikleri.bugunkuOdemeSayisi]);
            }

            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet');

            // Write file
            XLSX.writeFile(workbook, `rapor_${dateStr}.xlsx`);
          } catch (error) {
            console.error('Excel export hatası:', error);
            alert('Excel dosyası oluşturulamadı. Lütfen tekrar deneyin.');
          }
        })();
      }
    } catch (error) {
      console.error('Rapor indirme hatası:', error);
      alert('Rapor indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalUsers = reportData.users?.totalUsers ?? 0;
  const activeUsers = reportData.users?.activeUsers ?? 0;
  const formSubmissions = reportData.dashboard?.formSubmissions?.total ?? 0;
  const totalEmails = reportData.dashboard?.emails?.total ?? 0;
  const sentEmails = reportData.dashboard?.emails?.sent ?? 0;

  const formSubmissionsData = reportData.dashboard?.formSubmissions ? [
    { name: 'Çalışan', value: reportData.dashboard.formSubmissions.employees, color: '#3B82F6' },
    { name: 'İşveren', value: reportData.dashboard.formSubmissions.employers, color: '#10B981' },
    { name: 'İletişim', value: reportData.dashboard.formSubmissions.contact, color: '#F59E0B' }
  ].filter(item => item.value > 0) : [];

  const emailStatusData = reportData.dashboard?.emails ? [
    { name: 'Gönderildi', value: reportData.dashboard.emails.sent, color: '#10B981' },
    { name: 'Hatalı', value: reportData.dashboard.emails.failed, color: '#EF4444' }
  ].filter(item => item.value > 0) : [];

  const appointmentStatusData = reportData.dashboard?.appointments ? [
    { name: 'Onaylandı', value: reportData.dashboard.appointments.confirmed, color: '#10B981' },
    { name: 'Beklemede', value: reportData.dashboard.appointments.pending, color: '#F59E0B' },
    { name: 'Tamamlandı', value: reportData.dashboard.appointments.completed, color: '#3B82F6' },
    { name: 'İptal Edildi', value: reportData.dashboard.appointments.cancelled, color: '#EF4444' }
  ].filter(item => item.value > 0) : [];

  const paymentStatusData = reportData.dashboard?.payments ? [
    { name: 'Tamamlandı', value: reportData.dashboard.payments.completed, color: '#10B981' },
    { name: 'Beklemede', value: reportData.dashboard.payments.pending, color: '#F59E0B' },
    { name: 'Başarısız', value: reportData.dashboard.payments.failed, color: '#EF4444' },
    { name: 'İptal Edildi', value: reportData.dashboard.payments.cancelled, color: '#8B5CF6' },
    { name: 'İade Edildi', value: reportData.dashboard.payments.refunded, color: '#EC4899' }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Raporlar ve Analizler
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistem istatistikleri ve detaylı analizler
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <FaDownload />
              Rapor İndir
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownloadReport('csv')}>
              <FaFileAlt className="mr-2 h-4 w-4" />
              CSV olarak indir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownloadReport('excel')}>
              <FaFileAlt className="mr-2 h-4 w-4" />
              Excel olarak indir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownloadReport('json')}>
              <FaFileAlt className="mr-2 h-4 w-4" />
              JSON olarak indir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Toplam Kullanıcı</h3>
              <FaUsers className="text-2xl opacity-80" />
            </div>
            <p className="text-4xl font-bold">{totalUsers}</p>
            <p className="text-sm mt-2 opacity-90">
              {reportData.users?.adminCount ?? 0} Admin
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Aktif Kullanıcı</h3>
              <FaChartBar className="text-2xl opacity-80" />
            </div>
            <p className="text-4xl font-bold">{activeUsers}</p>
            <p className="text-sm mt-2 opacity-90">
              {totalUsers > 0 ? `${((activeUsers / totalUsers) * 100).toFixed(1)}%` : '0%'} aktivasyon
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Form Başvuruları</h3>
              <FaFileAlt className="text-2xl opacity-80" />
            </div>
            <p className="text-4xl font-bold">{formSubmissions}</p>
            <p className="text-sm mt-2 opacity-90">
              {reportData.dashboard?.formSubmissions?.employees ?? 0} Çalışan, {reportData.dashboard?.formSubmissions?.employers ?? 0} İşveren
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Toplam Gelir</h3>
              <FaCreditCard className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(reportData.dashboard?.payments?.totalRevenue || 0)}
            </p>
            <p className="text-sm mt-2 opacity-90">
              {reportData.dashboard?.payments?.completed ?? 0} tamamlanan ödeme
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Submissions Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Form Başvuruları Dağılımı</CardTitle>
            <CardDescription>Başvuru türlerine göre dağılım</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {formSubmissionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formSubmissionsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${typeof percent === 'number' ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formSubmissionsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Henüz form başvurusu yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Email Durumu</CardTitle>
            <CardDescription>Email gönderim durumları</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {emailStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emailStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${typeof percent === 'number' ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emailStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Henüz email verisi yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      {reportData.dashboard?.appointments && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Randevu Durumları</CardTitle>
              <CardDescription>Randevuların durum dağılımı</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {appointmentStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={appointmentStatusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]}>
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  Henüz randevu verisi yok
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status Chart */}
          {reportData.dashboard?.payments && (
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Durumları</CardTitle>
                <CardDescription>Ödemelerin durum dağılımı</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                {paymentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={paymentStatusData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]}>
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    Henüz ödeme verisi yok
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Time Series Charts */}
      {reportData.dashboard?.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Randevu Trendi - Son 30 Gün</CardTitle>
              <CardDescription>Günlük randevu oluşturma trendi</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.dashboard.charts.appointmentsLast30Days || []}>
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

          {/* Payments Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Gelir Trendi - Son 30 Gün</CardTitle>
              <CardDescription>Günlük ödeme gelir trendi</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.dashboard.charts.paymentsLast30Days || []}>
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
      )}
    </div>
  );
};

export default Reports;
