import { API_ROUTES } from '../config/api.config';

export class TokenService {
    private static instance: TokenService;
    private readonly TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly TOKEN_EXPIRATION_KEY = 'token_expiration';
    private refreshPromise: Promise<string | null> | null = null;

    private constructor() {}

    public static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }

    public setTokens(
        accessToken: string,
        refreshToken: string,
        expirationDate: Date,
        rememberMe: boolean = false
    ): void {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(this.TOKEN_KEY, accessToken);
        storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        storage.setItem(this.TOKEN_EXPIRATION_KEY, expirationDate.toISOString());
    }

    public async getToken(forceRefresh: boolean = false): Promise<string | null> {
        let token = sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
        const expirationStr = sessionStorage.getItem(this.TOKEN_EXPIRATION_KEY) || 
                             localStorage.getItem(this.TOKEN_EXPIRATION_KEY);

        if (!token || !expirationStr) {
            return null;
        }

        const expiration = new Date(expirationStr);
        const now = new Date();
        const timeUntilExpiration = expiration.getTime() - now.getTime();
        const fiveMinutes = 5 * 60 * 1000;

        // If token is expired, always try to refresh it
        if (timeUntilExpiration <= 0) {
            // Token is expired, try to refresh
            if (this.refreshPromise) {
                return await this.refreshPromise;
            }

            this.refreshPromise = this.performRefresh();
            try {
                const result = await this.refreshPromise;
                return result;
            } finally {
                this.refreshPromise = null;
            }
        }

        // If forceRefresh is true AND token is expiring soon (within 5 minutes), refresh it
        // But don't refresh if token is still fresh (just logged in)
        if (forceRefresh && timeUntilExpiration < fiveMinutes && timeUntilExpiration > 0) {
            // If a refresh is already in progress, wait for it
            if (this.refreshPromise) {
                return await this.refreshPromise;
            }

            // Start a new refresh operation
            this.refreshPromise = this.performRefresh();
            
            try {
                const result = await this.refreshPromise;
                // If refresh failed, return the existing token (it might still be valid)
                return result || token;
            } finally {
                // Clear the promise when done (success or failure)
                this.refreshPromise = null;
            }
        }

        // Token is still valid, return it
        return token;
    }

    private async performRefresh(): Promise<string | null> {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                console.warn('Refresh token not found, cannot refresh access token');
                // Don't clear tokens if refresh token is missing - might be a timing issue
                return null;
            }

            const response = await fetch(API_ROUTES.AUTH.REFRESH_TOKEN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn('Token refresh failed:', response.status, errorText);
                
                // Clear tokens on auth errors (400 = invalid token, 401/403 = unauthorized)
                if (response.status === 400 || response.status === 401 || response.status === 403) {
                    console.warn('Clearing tokens due to authentication error');
                    this.clearTokens();
                }
                return null;
            }

            // V2 backend returns AuthResponseDto: { accessToken, refreshToken, expiresAt, user }
            const responseData = await response.json();
            const storage = localStorage.getItem(this.TOKEN_KEY) ? localStorage : sessionStorage;
            const rememberMe = storage === localStorage;
            
            this.setTokens(
                responseData.accessToken,
                responseData.refreshToken,
                new Date(responseData.expiresAt),
                rememberMe
            );

            return responseData.accessToken;
        } catch (error) {
            console.error('Token yenileme hatası:', error);
            // Don't clear tokens on network errors, only on auth errors
            // Network errors might be temporary
            return null;
        }
    }

    public getRefreshToken(): string | null {
        return sessionStorage.getItem(this.REFRESH_TOKEN_KEY) || 
               localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    public clearTokens(): void {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(this.TOKEN_EXPIRATION_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRATION_KEY);
    }

    public isTokenExpired(): boolean {
        const expirationStr = sessionStorage.getItem(this.TOKEN_EXPIRATION_KEY) || 
                             localStorage.getItem(this.TOKEN_EXPIRATION_KEY);
        
        if (!expirationStr) {
            return true;
        }

        const expiration = new Date(expirationStr);
        return new Date() >= expiration;
    }
}

