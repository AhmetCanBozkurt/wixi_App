/**
 * Logger Service
 * 
 * Merkezi loglama servisi. Production ortamında loglar devre dışı kalır.
 * Tüm console.log, console.error, console.warn kullanımları bu servis ile değiştirilmelidir.
 * 
 * @example
 * import { Logger } from '@/utils/logger';
 * 
 * Logger.log('Bilgi mesajı');
 * Logger.warn('Uyarı mesajı');
 * Logger.error('Hata mesajı', error);
 * Logger.debug('Debug bilgisi', { data });
 */

import { isDev } from './env';

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

interface LoggerConfig {
    /** Logger'ın aktif olup olmadığı */
    enabled: boolean;
    /** Aktif log seviyeleri */
    levels: LogLevel[];
    /** Log prefix'i */
    prefix: string;
    /** Timestamp eklensin mi */
    showTimestamp: boolean;
}

const defaultConfig: LoggerConfig = {
    enabled: isDev,
    levels: ['log', 'warn', 'error', 'debug', 'info'],
    prefix: '[WIXI]',
    showTimestamp: true,
};

let config: LoggerConfig = { ...defaultConfig };

/**
 * Timestamp formatla
 */
const getTimestamp = (): string => {
    return new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

/**
 * Log mesajını formatla
 */
const formatMessage = (level: LogLevel, message: string): string => {
    const parts: string[] = [];

    if (config.prefix) {
        parts.push(config.prefix);
    }

    if (config.showTimestamp) {
        parts.push(`[${getTimestamp()}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);

    return parts.join(' ');
};

/**
 * Log seviyesinin aktif olup olmadığını kontrol et
 */
const isLevelEnabled = (level: LogLevel): boolean => {
    return config.enabled && config.levels.includes(level);
};

/**
 * Logger objesi
 */
export const Logger = {
    /**
     * Genel bilgi logu
     */
    log: (message: string, ...args: unknown[]): void => {
        if (isLevelEnabled('log')) {
            console.log(formatMessage('log', message), ...args);
        }
    },

    /**
     * Bilgi logu (log ile aynı)
     */
    info: (message: string, ...args: unknown[]): void => {
        if (isLevelEnabled('info')) {
            console.info(formatMessage('info', message), ...args);
        }
    },

    /**
     * Uyarı logu
     */
    warn: (message: string, ...args: unknown[]): void => {
        if (isLevelEnabled('warn')) {
            console.warn(formatMessage('warn', message), ...args);
        }
    },

    /**
     * Hata logu
     */
    error: (message: string, ...args: unknown[]): void => {
        if (isLevelEnabled('error')) {
            console.error(formatMessage('error', message), ...args);
        }
    },

    /**
     * Debug logu (sadece development)
     */
    debug: (message: string, ...args: unknown[]): void => {
        if (isLevelEnabled('debug')) {
            console.debug(formatMessage('debug', message), ...args);
        }
    },

    /**
     * Tablo formatında log
     */
    table: (data: unknown): void => {
        if (config.enabled) {
            console.table(data);
        }
    },

    /**
     * Grup başlat
     */
    group: (label: string): void => {
        if (config.enabled) {
            console.group(formatMessage('log', label));
        }
    },

    /**
     * Kapalı grup başlat
     */
    groupCollapsed: (label: string): void => {
        if (config.enabled) {
            console.groupCollapsed(formatMessage('log', label));
        }
    },

    /**
     * Grubu kapat
     */
    groupEnd: (): void => {
        if (config.enabled) {
            console.groupEnd();
        }
    },

    /**
     * Zaman ölçümü başlat
     */
    time: (label: string): void => {
        if (config.enabled) {
            console.time(`${config.prefix} ${label}`);
        }
    },

    /**
     * Zaman ölçümü bitir
     */
    timeEnd: (label: string): void => {
        if (config.enabled) {
            console.timeEnd(`${config.prefix} ${label}`);
        }
    },

    /**
     * Logger yapılandırmasını güncelle
     */
    configure: (newConfig: Partial<LoggerConfig>): void => {
        config = { ...config, ...newConfig };
    },

    /**
     * Logger'ı etkinleştir
     */
    enable: (): void => {
        config.enabled = true;
    },

    /**
     * Logger'ı devre dışı bırak
     */
    disable: (): void => {
        config.enabled = false;
    },

    /**
     * Mevcut yapılandırmayı al
     */
    getConfig: (): LoggerConfig => {
        return { ...config };
    },

    /**
     * Development ortamında mı kontrol et
     */
    isDev: (): boolean => {
        return isDev;
    },
};

// Default export
export default Logger;
