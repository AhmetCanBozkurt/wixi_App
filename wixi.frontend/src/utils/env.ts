const inferEnvFromHostname = (): 'production' | 'development' | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const hostname = window.location.hostname.toLowerCase();

  if (hostname === 'tekstil.wixisoftware.com' || hostname === 'www.tekstil.wixisoftware.com') {
    return 'production';
  }

  if (
    hostname === 'test.tekstil.wixisoftware.com' ||
    hostname === 'www.test.tekstil.wixisoftware.com'
  ) {
    return 'development';
  }

  return undefined;
};

const inferredEnv = inferEnvFromHostname();
export const appEnv =
  (import.meta.env.VITE_APP_ENV as 'production' | 'development' | undefined) ??
  inferredEnv ??
  'development';

export const isProd = appEnv === 'production';
export const isDev = !isProd;

