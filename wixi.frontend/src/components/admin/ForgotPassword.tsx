import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, ArrowLeft, BarChart3, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import authService from '../../ApiServices/services/AuthService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Decode token from URL (it might be URL encoded)
  const tokenParam = searchParams.get('token');
  const token = tokenParam ? decodeURIComponent(tokenParam) : null;
  const emailParam = searchParams.get('email');
  const email = emailParam ? decodeURIComponent(emailParam) : null;

  const [formEmail, setFormEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Reset password mode (when token is present)
  const isResetMode = !!token && !!email;

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(formEmail);
      setEmailSent(true);
    } catch (error) {
      console.error('Şifre sıfırlama isteği hatası:', error);
      // Error is already handled in AuthService
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!token || !email) {
        toast.error('Geçersiz sıfırlama bağlantısı');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Şifreler eşleşmiyor');
        return;
      }

      if (newPassword.length < 8) {
        toast.error('Şifre en az 8 karakter olmalıdır');
        return;
      }

      await authService.resetPassword(token, email, newPassword, confirmPassword);
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      // Error is already handled in AuthService
    } finally {
      setLoading(false);
    }
  };

  if (emailSent && !isResetMode) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Email Gönderildi
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Şifre sıfırlama bağlantısı <strong>{formEmail}</strong> adresine gönderildi.
                Lütfen e-posta kutunuzu kontrol edin.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setFormEmail('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Başka bir email dene
                </Button>
                <Link to="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Giriş sayfasına dön
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-8 md:p-12">
            {/* Logo & Title */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Worklines Pro</h1>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                {isResetMode ? 'Yeni Şifre Oluştur' : 'Şifremi Unuttum'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {isResetMode
                  ? 'Yeni şifrenizi belirleyin'
                  : 'E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim'}
              </p>
            </div>

            {/* Form */}
            {isResetMode ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Email (readonly) */}
                <div>
                  <Label htmlFor="email" className="text-gray-900 dark:text-white text-base font-medium mb-2 block">
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email || ''}
                    disabled
                    className="h-14 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* New Password */}
                <div>
                  <Label htmlFor="newPassword" className="text-gray-900 dark:text-white text-base font-medium mb-2 block">
                    Yeni Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="En az 8 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-14 pr-12 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white text-base font-medium mb-2 block">
                    Şifre Tekrar
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Şifrenizi tekrar girin"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-14 pr-12 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="flex-1 h-14"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="text-gray-900 dark:text-white text-base font-medium mb-2 block">
                    E-posta Adresi
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="h-14 pl-12 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Info Text */}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Link to="/login" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-14"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Geri
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Gönderiliyor...' : 'Gönder'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-8 py-4">
            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 Worklines Pro Consulting. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

