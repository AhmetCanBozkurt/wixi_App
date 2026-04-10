import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import licenseService from '@/ApiServices/services/LicenseService';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

const LicenseKeyEntry = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [currentLicenseStatus, setCurrentLicenseStatus] = useState<{
    isValid: boolean;
    isExpired: boolean;
    expireDate?: string;
    daysRemaining?: number;
    tenantCompanyName?: string;
  } | null>(null);
  const navigate = useNavigate();

  const checkLicenseStatus = async () => {
    try {
      setCheckingStatus(true);
      // Use admin endpoint to get detailed license information (it's AllowAnonymous)
      const status = await licenseService.getLicenseStatus();
      // Calculate isExpired from daysRemaining
      const isExpired = status.daysRemaining !== undefined && status.daysRemaining <= 0;
      setCurrentLicenseStatus({
        isValid: status.isValid && !isExpired,
        isExpired: isExpired,
        expireDate: status.expireDate,
        daysRemaining: status.daysRemaining,
        tenantCompanyName: status.tenantCompanyName
      });
      // Don't redirect - allow user to view/manage license even if valid
    } catch (err) {
      // If error, show license entry form
      Logger.log('License check failed, showing entry form');
      setCurrentLicenseStatus({ isValid: false, isExpired: true });
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkLicenseStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await licenseService.validateLicense(licenseKey);

      if (result.success && result.data?.isValid) {
        setSuccess(true);
        toast.success('Lisans başarıyla doğrulandı ve kaydedildi!');

        // Clear license cache
        try {
          await licenseService.clearLicenseCache();
        } catch (err) {
          console.warn('Cache temizlenemedi:', err);
        }

        // Update current license status
        setCurrentLicenseStatus({
          isValid: true,
          isExpired: false,
          expireDate: result.data.expireDate,
          daysRemaining: result.data.daysRemaining,
          tenantCompanyName: result.data.tenantCompanyName
        });

        // Clear the input
        setLicenseKey('');

        // Redirect to admin dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/admin', { replace: true });
          // Force page reload to refresh license status
          window.location.reload();
        }, 1500);
      } else {
        setError(result.message || 'Lisans anahtarı geçersiz veya süresi dolmuş');
        toast.error(result.message || 'Lisans anahtarı geçersiz');
      }
    } catch (err: any) {
      setError(err.message || 'Lisans doğrulanırken bir hata oluştu');
      toast.error(err.message || 'Lisans doğrulanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await licenseService.clearLicenseCache();
      toast.success('Lisans cache temizlendi');
      // Refresh status
      await checkLicenseStatus();
    } catch (err: any) {
      toast.error(err.message || 'Cache temizlenirken hata oluştu');
    }
  };

  if (checkingStatus) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Lisans durumu kontrol ediliyor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">Lisans Yönetimi</CardTitle>
                <CardDescription>
                  {currentLicenseStatus?.isValid && !currentLicenseStatus?.isExpired
                    ? 'Mevcut lisansınız geçerli. Yeni bir lisans anahtarı girebilir veya mevcut lisansınızı görüntüleyebilirsiniz.'
                    : 'Sisteme erişmek için geçerli bir lisans anahtarı girmeniz gerekmektedir.'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Cache Temizle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Current License Status */}
          {!checkingStatus && currentLicenseStatus && (
            <Alert className={`mb-4 ${currentLicenseStatus.isValid && !currentLicenseStatus.isExpired
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'}`}>
              {currentLicenseStatus.isValid && !currentLicenseStatus.isExpired ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Lisans Geçerli</strong>
                    {currentLicenseStatus.tenantCompanyName && (
                      <div className="mt-1 text-sm">
                        Firma: {currentLicenseStatus.tenantCompanyName}
                      </div>
                    )}
                    {currentLicenseStatus.expireDate && (
                      <div className="mt-1 text-sm">
                        Bitiş Tarihi: {new Date(currentLicenseStatus.expireDate).toLocaleDateString('tr-TR')}
                        {currentLicenseStatus.daysRemaining !== undefined && currentLicenseStatus.daysRemaining > 0 && (
                          <span className="font-semibold"> ({currentLicenseStatus.daysRemaining} gün kaldı)</span>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    <strong>Lisans Geçersiz veya Süresi Dolmuş</strong>
                    <div className="mt-1 text-sm">Yeni bir lisans anahtarı girmeniz gerekmektedir.</div>
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Lisans başarıyla doğrulandı ve kaydedildi! Ana sayfaya yönlendiriliyorsunuz...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="licenseKey">Lisans Anahtarı</Label>
              <Input
                id="licenseKey"
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                disabled={loading || success}
                required
                className="font-mono text-center text-lg"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lisans anahtarınızı yukarıdaki alana girin
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || success || !licenseKey.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Başarılı - Yönlendiriliyor...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Lisansı Doğrula ve Kaydet
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Lisans Anahtarı Nasıl Alınır?</strong>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Lisans anahtarınızı almak için sistem yöneticinizle iletişime geçin</li>
                  <li>Lisans anahtarı XXXX-XXXX-XXXX-XXXX formatında olmalıdır</li>
                  <li>Lisans anahtarı girildikten sonra otomatik olarak doğrulanacaktır</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseKeyEntry;

