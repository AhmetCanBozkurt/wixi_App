import { BASE_URL } from '../config/api.config';
import { TokenService } from './TokenService';
import type { ClientNoteDto, CreateClientNoteDto, UpdateClientNoteDto } from '../types/ClientNoteTypes';

const clientNoteService = {
  // Get all notes for a client
  async getClientNotes(clientId: number): Promise<ClientNoteDto[]> {
    try {
      const token = await TokenService.getInstance().getToken();
      const url = `${BASE_URL}/api/v1.0/clients/${clientId}/notes`;
      console.log('🔗 Fetching notes from:', url);
      const response = await fetch(url, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include',
      });
      console.log('📡 Notes response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Notes API error:', errorText);
        throw new Error(`Failed to load client notes: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📦 Notes response data:', data);
      return data?.data || data || [];
    } catch (error: any) {
      console.error('❌ getClientNotes error:', error);
      throw error;
    }
  },

  // Get a specific note by ID
  async getClientNote(clientId: number, noteId: number): Promise<ClientNoteDto | null> {
    try {
      const token = await TokenService.getInstance().getToken();
      const response = await fetch(`${BASE_URL}/api/v1.0/clients/${clientId}/notes/${noteId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include',
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to load client note');
      const data = await response.json();
      return data?.data || data || null;
    } catch (error: any) {
      throw error;
    }
  },

  // Create a new note
  async createClientNote(clientId: number, dto: CreateClientNoteDto): Promise<ClientNoteDto> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/clients/${clientId}/notes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '' 
      },
      credentials: 'include',
      body: JSON.stringify({ ...dto, clientId }),
    });
    if (!response.ok) throw new Error('Failed to create client note');
    const data = await response.json();
    return data?.data || data;
  },

  // Update a note
  async updateClientNote(clientId: number, noteId: number, dto: UpdateClientNoteDto): Promise<ClientNoteDto> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/clients/${clientId}/notes/${noteId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '' 
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to update client note');
    const data = await response.json();
    return data?.data || data;
  },

  // Delete a note
  async deleteClientNote(clientId: number, noteId: number): Promise<boolean> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/clients/${clientId}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete client note');
    return true;
  }
};

export default clientNoteService;

