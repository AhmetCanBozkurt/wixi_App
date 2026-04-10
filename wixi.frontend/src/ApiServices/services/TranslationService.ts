import { BASE_URL } from '../config/api.config';
import { TokenService } from './TokenService';

export type Lang = 'de' | 'tr' | 'en' | 'ar';

class TranslationService {
  async getPublic(lang: Lang): Promise<Record<string, string>> {
    const res = await fetch(`${BASE_URL}/api/v1.0/i18n?lang=${lang}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return {};
    return await res.json();
  }

  private async authHeaders(): Promise<HeadersInit> {
    const token = await TokenService.getInstance().getToken();
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  async list(search = '', page = 1, pageSize = 50) {
    const headers = await this.authHeaders();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/translations?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`, { headers, credentials: 'include' });
    if (!res.ok) throw new Error('Failed to list translations');
    const data = await res.json();
    // Backend returns { success: true, items: [...] }
    return data.items || [];
  }

  async upsert(item: { key: string; de?: string; tr?: string; en?: string; ar?: string }) {
    const headers = await this.authHeaders();
    // Backend expects: { Key, De, Tr, En, Ar }
    const body = {
      Key: item.key,
      De: item.de,
      Tr: item.tr,
      En: item.en,
      Ar: item.ar
    };
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/translations`, { method: 'POST', headers, credentials: 'include', body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Failed to save translation');
  }

  async invalidate(lang?: Lang) {
    const headers = await this.authHeaders();
    const url = `${BASE_URL}/api/v1.0/admin/translations/invalidate${lang ? `?lang=${lang}` : ''}`;
    await fetch(url, { method: 'POST', headers, credentials: 'include' });
  }
}

export default new TranslationService();


