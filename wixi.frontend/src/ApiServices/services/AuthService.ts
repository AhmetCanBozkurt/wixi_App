import { API_ROUTES, API_VERSION } from '../config/api.config';
import type { ILoginDto, IRegisterDto, ITokenDto, IEnable2FADto, IVerify2FADto, ICurrentUser } from '../types/AuthTypes';
import { TokenService } from './TokenService';
import { toast } from 'react-toastify';
import { Logger } from '../../utils/logger';

class AuthService {
    private static instance: AuthService;
    private tokenService: TokenService;

    private constructor() {
        this.tokenService = TokenService.getInstance();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async login(loginDto: ILoginDto): Promise<ITokenDto> {
        try {
            const response = await fetch(API_ROUTES.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userNameOrEmail: loginDto.email,
                    password: loginDto.password
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Giriş yapılırken bir hata oluştu';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.title || errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                toast.error(errorMessage);
                throw new Error(errorText);
            }

            const responseData = await response.json();

            // V2 backend returns AuthResponseDto: { accessToken, refreshToken, expiresAt, user }
            const tokenDto: ITokenDto = {
                accessToken: responseData.accessToken,
                refreshToken: responseData.refreshToken,
                accessTokenExpiration: new Date(responseData.expiresAt),
                refreshTokenExpiration: new Date(responseData.expiresAt), // V2 doesn't return refresh expiration separately
                requiresTwoFactor: false,
                email: responseData.user?.email || loginDto.email
            };

            this.tokenService.setTokens(
                tokenDto.accessToken,
                tokenDto.refreshToken,
                tokenDto.accessTokenExpiration,
                true
            );
            toast.success('Başarıyla giriş yapıldı');
            return tokenDto;
        } catch (error) {
            Logger.error('Giriş yapılırken bir hata oluştu:', error);
            throw error;
        }
    }

    async register(registerDto: IRegisterDto): Promise<ITokenDto> {
        try {
            const response = await fetch(API_ROUTES.AUTH.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: registerDto.email,
                    password: registerDto.password,
                    firstName: registerDto.firstName,
                    lastName: registerDto.lastName,
                    phoneNumber: registerDto.phone,
                    userName: registerDto.email, // V2 backend requires userName
                    clientCode: registerDto.clientCode || undefined,
                    dateOfBirth: registerDto.dateOfBirth || undefined,
                    address: registerDto.address || undefined,
                    nationality: registerDto.nationality || undefined,
                    educationTypeId: registerDto.educationTypeId || undefined,
                    educationHistory: registerDto.educationHistory || undefined
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Kayıt olurken bir hata oluştu';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.title || errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                toast.error(errorMessage);
                throw new Error(errorText);
            }

            const responseData = await response.json();

            // V2 backend returns AuthResponseDto: { accessToken, refreshToken, expiresAt, user }
            const tokenDto: ITokenDto = {
                accessToken: responseData.accessToken,
                refreshToken: responseData.refreshToken,
                accessTokenExpiration: new Date(responseData.expiresAt),
                refreshTokenExpiration: new Date(responseData.expiresAt), // V2 doesn't return refresh expiration separately
                requiresTwoFactor: false,
                email: responseData.user?.email || registerDto.email
            };

            this.tokenService.setTokens(
                tokenDto.accessToken,
                tokenDto.refreshToken,
                tokenDto.accessTokenExpiration
            );
            toast.success('Başarıyla kayıt olundu');
            return tokenDto;
        } catch (error) {
            Logger.error('Kayıt olurken bir hata oluştu:', error);
            throw error;
        }
    }

    async logout(isAdminArea: boolean = false): Promise<void> {
        try {
            const token = await this.tokenService.getToken(isAdminArea);

            if (!token) {
                this.tokenService.clearTokens();
                return;
            }

            // V2 backend logout requires only Authorization header
            if (isAdminArea) {
                const response = await fetch(API_ROUTES.AUTH.LOGOUT, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    Logger.error('Logout error:', errorText);
                    // Don't throw error, just clear tokens
                }
            }

            this.tokenService.clearTokens();
        } catch (error) {
            Logger.error('Çıkış yapılırken bir hata oluştu:', error);
            // Clear tokens even if logout request fails
            this.tokenService.clearTokens();
        }
    }

    // Note: 2FA endpoints are not implemented in V2 backend yet
    async enable2FA(enable2FADto: IEnable2FADto): Promise<void> {
        throw new Error('2FA is not implemented in V2 backend yet');
    }

    async verify2FA(verify2FADto: IVerify2FADto): Promise<ITokenDto> {
        throw new Error('2FA is not implemented in V2 backend yet');
    }

    async getCurrentUser(isAdminArea: boolean = false): Promise<ICurrentUser | null> {
        try {
            const token = await this.tokenService.getToken(isAdminArea);
            if (!token) {
                return null;
            }

            const response = await fetch(API_ROUTES.AUTH.GET_CURRENT_USER, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.tokenService.clearTokens();
                    return null;
                }
                throw new Error('Kullanıcı bilgileri alınamadı');
            }

            const userData = await response.json();

            // V2 backend returns UserDto: { id, userName, email, firstName, lastName, phoneNumber, roles, ... }
            const currentUser: ICurrentUser = {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                roles: userData.roles || []
            };

            return currentUser;
        } catch (error) {
            Logger.error('Kullanıcı bilgileri alınırken hata:', error);
            return null;
        }
    }

    async isAdmin(): Promise<boolean> {
        try {
            const currentUser = await this.getCurrentUser(true);
            if (!currentUser) {
                return false;
            }
            return currentUser.roles.includes('Admin');
        } catch (error) {
            Logger.error('Admin kontrolü yapılırken hata:', error);
            return false;
        }
    }

    async forgotPassword(email: string): Promise<void> {
        try {
            const response = await fetch(`${API_ROUTES.BASE_URL}/api/${API_VERSION}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Şifre sıfırlama isteği gönderilirken bir hata oluştu';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.title || errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                toast.error(errorMessage);
                throw new Error(errorText);
            }

            toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
        } catch (error) {
            Logger.error('Şifre sıfırlama isteği gönderilirken hata:', error);
            throw error;
        }
    }

    async resetPassword(token: string, email: string, newPassword: string, confirmPassword: string): Promise<void> {
        try {
            if (newPassword !== confirmPassword) {
                toast.error('Şifreler eşleşmiyor');
                throw new Error('Passwords do not match');
            }

            const response = await fetch(`${API_ROUTES.BASE_URL}/api/${API_VERSION}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    email,
                    newPassword,
                    confirmPassword
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Şifre sıfırlanırken bir hata oluştu';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.title || errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                toast.error(errorMessage);
                throw new Error(errorText);
            }

            toast.success('Şifreniz başarıyla sıfırlandı');
        } catch (error) {
            Logger.error('Şifre sıfırlanırken hata:', error);
            throw error;
        }
    }
}

const authService = AuthService.getInstance();
export default authService;

