import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Shield, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  Key,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import licenseService from '../../ApiServices/services/LicenseService';
import { useI18n } from '../../hooks/useI18n';

interface LicenseStatus {
  isValid: boolean;
  expireDate?: string;
  isExpired: boolean;
  daysRemaining: number;
  tenantCompanyName?: string;
  lastValidatedAt?: string;
}

const LicenseInfo: React.FC = () => {
  const { translate } = useI18n();
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLicenseStatus();
  }, []);

  const loadLicenseStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get detailed license status (requires authentication)
      try {
        const status = await licenseService.getLicenseStatus();
        setLicenseStatus(status);
      } catch (authError) {
        // If detailed status fails, try public status
        console.warn('Could not load detailed license status, trying public status:', authError);
        try {
          const publicStatus = await licenseService.getPublicLicenseStatus();
          setLicenseStatus({
            isValid: publicStatus.isValid,
            isExpired: publicStatus.isExpired,
            daysRemaining: 0,
          });
        } catch (publicError) {
          console.error('Could not load public license status:', publicError);
          setError('Lisans bilgileri yüklenirken hata oluştu');
        }
      }
    } catch (err) {
      console.error('Error loading license status:', err);
      setError('Lisans bilgileri yüklenirken hata oluştu');
      toast.error('Lisans bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!licenseStatus) return 'text-gray-500';
    if (licenseStatus.isExpired) return 'text-red-600';
    if (licenseStatus.daysRemaining <= 7) return 'text-yellow-600';
    if (licenseStatus.isValid) return 'text-green-600';
    return 'text-gray-500';
  };

  const getStatusIcon = () => {
    if (!licenseStatus) return <Clock className="w-6 h-6 text-gray-400" />;
    if (licenseStatus.isExpired) return <XCircle className="w-6 h-6 text-red-600" />;
    if (licenseStatus.daysRemaining <= 7) return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    if (licenseStatus.isValid) return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    return <XCircle className="w-6 h-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (!licenseStatus) return translate('client.license.status.unknown', 'Bilinmiyor');
    if (licenseStatus.isExpired) return translate('client.license.status.expired', 'Süresi Dolmuş');
    if (licenseStatus.daysRemaining <= 7) return translate('client.license.status.expiringSoon', 'Yakında Sona Erecek');
    if (licenseStatus.isValid) return translate('client.license.status.active', 'Aktif');
    return translate('client.license.status.invalid', 'Geçersiz');
  };

  const getStatusBadgeColor = () => {
    if (!licenseStatus) return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    if (licenseStatus.isExpired) return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400';
    if (licenseStatus.daysRemaining <= 7) return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400';
    if (licenseStatus.isValid) return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400';
    return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {translate('client.license.loading', 'Lisans bilgileri yükleniyor...')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="max-w-md w-full border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {translate('client.license.error.title', 'Hata Oluştu')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={loadLicenseStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {translate('client.license.error.retry', 'Tekrar Dene')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
          {translate('client.license.title', 'Lisans Bilgileri')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {translate('client.license.subtitle', 'Sistemin lisans durumu ve geçerlilik bilgileri')}
        </p>
      </div>

      {/* License Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Main Status Card */}
        <Card className={`border-l-4 ${
          licenseStatus?.isExpired 
            ? 'border-l-red-500' 
            : licenseStatus?.daysRemaining && licenseStatus.daysRemaining <= 7
            ? 'border-l-yellow-500'
            : licenseStatus?.isValid
            ? 'border-l-green-500'
            : 'border-l-gray-500'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className={`w-6 h-6 ${getStatusColor()}`} />
              {translate('client.license.status.title', 'Lisans Durumu')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {translate('client.license.status.current', 'Mevcut Durum')}
                  </p>
                  <Badge className={getStatusBadgeColor()} variant="outline">
                    {getStatusText()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Status Details */}
            {licenseStatus && (
              <div className="space-y-4">
                {/* Validity */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {licenseStatus.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {translate('client.license.validity', 'Geçerlilik')}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    licenseStatus.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {licenseStatus.isValid 
                      ? translate('client.license.valid', 'Geçerli') 
                      : translate('client.license.invalid', 'Geçersiz')}
                  </span>
                </div>

                {/* Days Remaining */}
                {licenseStatus.daysRemaining !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {translate('client.license.daysRemaining', 'Kalan Gün')}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${
                      licenseStatus.daysRemaining <= 7 ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {licenseStatus.daysRemaining} {translate('client.license.days', 'gün')}
                    </span>
                  </div>
                )}

                {/* Expire Date */}
                {licenseStatus.expireDate && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {translate('client.license.expireDate', 'Son Geçerlilik Tarihi')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(licenseStatus.expireDate).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              {translate('client.license.company.title', 'Şirket Bilgileri')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Company Name */}
              {licenseStatus?.tenantCompanyName && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {translate('client.license.company.name', 'Şirket Adı')}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {licenseStatus.tenantCompanyName}
                  </span>
                </div>
              )}

              {/* Last Validated */}
              {licenseStatus?.lastValidatedAt && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {translate('client.license.lastValidated', 'Son Kontrol')}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(licenseStatus.lastValidatedAt).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              {/* License Type */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('client.license.type', 'Lisans Tipi')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {translate('client.license.type.standard', 'Standart')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Messages */}
      {licenseStatus && (
        <>
          {/* Expired Warning */}
          {licenseStatus.isExpired && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
                      {translate('client.license.warning.expired.title', 'Lisans Süresi Doldu')}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {translate(
                        'client.license.warning.expired.message',
                        'Sistem lisansının süresi dolmuştur. Lütfen sistem yöneticisi ile iletişime geçin.'
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiring Soon Warning */}
          {!licenseStatus.isExpired && licenseStatus.daysRemaining <= 7 && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-400 mb-2">
                      {translate('client.license.warning.expiring.title', 'Lisans Süresi Yakında Dolacak')}
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {translate(
                        'client.license.warning.expiring.message',
                        'Sistem lisansının süresi {days} gün içinde dolacaktır. Lütfen sistem yöneticisi ile iletişime geçin.',
                        { days: licenseStatus.daysRemaining }
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-2">
                {translate('client.license.info.title', 'Bilgilendirme')}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                {translate(
                  'client.license.info.message1',
                  'Bu sayfada sistemin lisans durumunu görüntüleyebilirsiniz.'
                )}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {translate(
                  'client.license.info.message2',
                  'Lisans yönetimi ve güncelleme işlemleri için lütfen sistem yöneticisi ile iletişime geçin.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseInfo;

