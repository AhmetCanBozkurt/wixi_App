import { BASE_URL } from '../config/api.config';
import { TokenService } from './TokenService';
import type { TablePreferenceDto, UpdateTablePreferenceDto } from '../types/TablePreferenceTypes';

const tablePreferenceService = {
  async getTablePreference(tableKey: string): Promise<TablePreferenceDto | null> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/user/table-preferences/tables/${tableKey}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Table preference could not be loaded');
    }

    return response.json();
  },

  async saveTablePreference(tableKey: string, payload: UpdateTablePreferenceDto): Promise<TablePreferenceDto> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/user/table-preferences/tables/${tableKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Table preference could not be saved');
    }

    return response.json();
  },
};

export default tablePreferenceService;

