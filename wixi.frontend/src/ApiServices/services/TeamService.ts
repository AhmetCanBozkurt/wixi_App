import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';

export interface TeamMember {
  id: number;
  slug: string;
  name: string;
  image: string;
  email: string;
  phone?: string;
  experience: string;
  position: string;
  location: string;
  education: string;
  bio: string;
  philosophy?: string;
  specializations: string[];
  languages: string[];
  achievements: string[];
  canProvideConsultation?: boolean;
  consultationPrice?: number;
  consultationCurrency?: string;
}

export interface TeamMemberDto {
  name: string;
  slug: string;
  imageUrl: string;
  email: string;
  phone?: string;
  experience: string;
  positionDe: string;
  positionTr: string;
  positionEn?: string;
  positionAr?: string;
  locationDe: string;
  locationTr: string;
  locationEn?: string;
  locationAr?: string;
  educationDe: string;
  educationTr: string;
  educationEn?: string;
  educationAr?: string;
  bioDe: string;
  bioTr: string;
  bioEn?: string;
  bioAr?: string;
  philosophyDe?: string;
  philosophyTr?: string;
  philosophyEn?: string;
  philosophyAr?: string;
  specializationsDe?: string | string[];  // Can be string (JSON) or array (for form)
  specializationsTr?: string | string[];
  specializationsEn?: string | string[];
  specializationsAr?: string | string[];
  languagesDe?: string | string[];
  languagesTr?: string | string[];
  languagesEn?: string | string[];
  languagesAr?: string | string[];
  achievementsDe?: string | string[];
  achievementsTr?: string | string[];
  achievementsEn?: string | string[];
  achievementsAr?: string | string[];
  displayOrder: number;
  isActive: boolean;
  canProvideConsultation?: boolean;
  consultationPrice?: number;
  consultationCurrency?: string;
}

class TeamService {
  async getTeamMembers(lang: string = 'de'): Promise<{ success: boolean; items: TeamMember[] }> {
    try {
      const response = await fetch(`${API_ROUTES.TEAM_MEMBERS.BASE}?lang=${lang}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const result = await response.json();
      
      // Map backend response to frontend interface
      // Backend returns imageUrl, but frontend expects image
      // Also map language-specific fields
      if (result.success && result.items) {
        const mappedItems: TeamMember[] = result.items.map((item: any) => {
          // Parse JSON arrays for specializations, languages, achievements
          const parseJsonArray = (jsonString: string | null | undefined): string[] => {
            if (!jsonString) return [];
            try {
              const parsed = JSON.parse(jsonString);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          };

          // Get language-specific fields
          const position = lang === 'tr' ? item.positionTr : lang === 'en' ? (item.positionEn || item.positionDe) : item.positionDe;
          const location = lang === 'tr' ? item.locationTr : lang === 'en' ? (item.locationEn || item.locationDe) : item.locationDe;
          const education = lang === 'tr' ? item.educationTr : lang === 'en' ? (item.educationEn || item.educationDe) : item.educationDe;
          const bio = lang === 'tr' ? item.bioTr : lang === 'en' ? (item.bioEn || item.bioDe) : item.bioDe;
          const philosophy = lang === 'tr' ? item.philosophyTr : lang === 'en' ? (item.philosophyEn || item.philosophyDe) : item.philosophyDe;
          const specializations = lang === 'tr' ? parseJsonArray(item.specializationsTr) : lang === 'en' ? parseJsonArray(item.specializationsEn || item.specializationsDe) : parseJsonArray(item.specializationsDe);
          const languages = lang === 'tr' ? parseJsonArray(item.languagesTr) : lang === 'en' ? parseJsonArray(item.languagesEn || item.languagesDe) : parseJsonArray(item.languagesDe);
          const achievements = lang === 'tr' ? parseJsonArray(item.achievementsTr) : lang === 'en' ? parseJsonArray(item.achievementsEn || item.achievementsDe) : parseJsonArray(item.achievementsDe);

          return {
            id: item.id,
            slug: item.slug,
            name: item.name,
            image: item.imageUrl || item.image || '', // Map imageUrl to image
            email: item.email,
            phone: item.phone,
            experience: item.experience,
            position: position || '',
            location: location || '',
            education: education || '',
            bio: bio || '',
            philosophy: philosophy,
            specializations: specializations,
            languages: languages,
            achievements: achievements,
            canProvideConsultation: item.canProvideConsultation || false,
            consultationPrice: item.consultationPrice,
            consultationCurrency: item.consultationCurrency || 'EUR',
          };
        });

        return {
          success: true,
          items: mappedItems,
        };
      }

      return result;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  async getTeamMemberBySlug(slug: string, lang: string = 'de'): Promise<{ success: boolean; item: TeamMember }> {
    try {
      const response = await fetch(`${API_ROUTES.TEAM_MEMBERS.BY_SLUG(slug)}?lang=${lang}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team member');
      }

      const result = await response.json();
      
      // Map backend response to frontend interface
      if (result.success && result.item) {
        const item = result.item;
        
        // Parse JSON arrays
        const parseJsonArray = (jsonString: string | null | undefined): string[] => {
          if (!jsonString) return [];
          try {
            const parsed = JSON.parse(jsonString);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        };

        // Get language-specific fields
        const position = lang === 'tr' ? item.positionTr : lang === 'en' ? (item.positionEn || item.positionDe) : item.positionDe;
        const location = lang === 'tr' ? item.locationTr : lang === 'en' ? (item.locationEn || item.locationDe) : item.locationDe;
        const education = lang === 'tr' ? item.educationTr : lang === 'en' ? (item.educationEn || item.educationDe) : item.educationDe;
        const bio = lang === 'tr' ? item.bioTr : lang === 'en' ? (item.bioEn || item.bioDe) : item.bioDe;
        const philosophy = lang === 'tr' ? item.philosophyTr : lang === 'en' ? (item.philosophyEn || item.philosophyDe) : item.philosophyDe;
        const specializations = lang === 'tr' ? parseJsonArray(item.specializationsTr) : lang === 'en' ? parseJsonArray(item.specializationsEn || item.specializationsDe) : parseJsonArray(item.specializationsDe);
        const languages = lang === 'tr' ? parseJsonArray(item.languagesTr) : lang === 'en' ? parseJsonArray(item.languagesEn || item.languagesDe) : parseJsonArray(item.languagesDe);
        const achievements = lang === 'tr' ? parseJsonArray(item.achievementsTr) : lang === 'en' ? parseJsonArray(item.achievementsEn || item.achievementsDe) : parseJsonArray(item.achievementsDe);

        const mappedItem: TeamMember = {
          id: item.id,
          slug: item.slug,
          name: item.name,
          image: item.imageUrl || item.image || '', // Map imageUrl to image
          email: item.email,
          phone: item.phone,
          experience: item.experience,
          position: position || '',
          location: location || '',
          education: education || '',
          bio: bio || '',
          philosophy: philosophy,
          specializations: specializations,
          languages: languages,
          achievements: achievements,
          canProvideConsultation: item.canProvideConsultation || false,
          consultationPrice: item.consultationPrice,
          consultationCurrency: item.consultationCurrency || 'EUR',
        };

        return {
          success: true,
          item: mappedItem,
        };
      }

      return result;
    } catch (error) {
      console.error('Error fetching team member:', error);
      throw error;
    }
  }

  async getAllTeamMembers(): Promise<{ success: boolean; items: any[] }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.TEAM_MEMBERS.ADMIN.BASE, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  async getTeamMemberById(id: number): Promise<{ success: boolean; item: any }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.TEAM_MEMBERS.ADMIN.BY_ID(id), {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team member');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching team member:', error);
      throw error;
    }
  }

  async createTeamMember(data: TeamMemberDto): Promise<{ success: boolean; id: number; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.TEAM_MEMBERS.ADMIN.BASE, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create team member');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  }

  async updateTeamMember(id: number, data: TeamMemberDto): Promise<{ success: boolean; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.TEAM_MEMBERS.ADMIN.BY_ID(id), {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update team member');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  }

  async deleteTeamMember(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.TEAM_MEMBERS.ADMIN.BY_ID(id), {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete team member');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<{ success: boolean; imageUrl: string; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_ROUTES.TEAM_MEMBERS.ADMIN.UPLOAD_IMAGE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to upload image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

export default new TeamService();

