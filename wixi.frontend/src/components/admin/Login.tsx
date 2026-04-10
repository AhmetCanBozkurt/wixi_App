import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, BarChart3 } from 'lucide-react';
import authService from '../../ApiServices/services/AuthService';
import { TokenService } from '../../ApiServices/services/TokenService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

const tokenService = TokenService.getInstance();

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      if (response.requiresTwoFactor) {
        setShowVerification(true);
        toast.info('Doğrulama kodu e-posta adresinize gönderildi');
      } else {
        // Token is already saved in AuthService.login
        // Use the token from response directly (no need to refresh)
        const token = response.accessToken;
        
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userRoles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            const rolesArray = Array.isArray(userRoles) ? userRoles : (userRoles ? [userRoles] : []);
            
            const role = rolesArray[0];
            // Only Admin login allowed for Tekstil project
            if (role === 'Admin') {
              navigate('/admin', { replace: true });
            } else {
              toast.error('Bu sisteme sadece Admin kullanıcıları giriş yapabilir.');
              tokenService.clearTokens();
            }
          } catch (tokenError) {
            console.error('Token decode error:', tokenError);
            toast.error('Token işlenirken bir hata oluştu');
            tokenService.clearTokens();
          }
        } else {
          toast.error('Token alınamadı');
          tokenService.clearTokens();
        }
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      toast.error('Giriş başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.verify2FA({ email, code: verificationCode });
      
      // Token is already saved in AuthService.verify2FA
      // Use the token from response directly (no need to refresh)
      const token = response?.accessToken;
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userRoles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          const rolesArray = Array.isArray(userRoles) ? userRoles : (userRoles ? [userRoles] : []);
          
          const role = rolesArray[0];
          // Only Admin login allowed for Tekstil project
          if (role === 'Admin') {
            navigate('/admin', { replace: true });
          } else {
            toast.error('Bu sisteme sadece Admin kullanıcıları giriş yapabilir.');
            tokenService.clearTokens();
          }
        } catch (tokenError) {
          console.error('Token decode error:', tokenError);
          toast.error('Token işlenirken bir hata oluştu');
          tokenService.clearTokens();
        }
      } else {
        toast.error('Token alınamadı');
        tokenService.clearTokens();
      }
    } catch (error) {
      console.error('Doğrulama hatası:', error);
      toast.error('Doğrulama başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

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

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                {showVerification ? 'Verify Your Account' : 'Login'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {showVerification ? 'Enter the verification code sent to your email.' : 'Please enter your details to login.'}
              </p>
            </div>

            {/* Login Form */}
            {!showVerification ? (
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Username/Email Field */}
                <div>
                  <Label htmlFor="email" className="text-gray-900 dark:text-white text-base font-medium mb-2 block">
                    Username
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your username or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password" className="text-gray-900 dark:text-white text-base font-medium mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pr-12 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      required
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor="remember" className="text-gray-900 dark:text-white cursor-pointer">
                      Remember Me
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-sm"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            ) : (
              /* 2FA Verification Form */
              <form onSubmit={handleVerification} className="space-y-6">
                <div>
                  <Label htmlFor="verificationCode" className="text-gray-900 dark:text-white text-base font-medium mb-2 block">
                    Verification Code
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="h-14 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVerification(false)}
                    className="flex-1 h-14"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
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

export default Login;
