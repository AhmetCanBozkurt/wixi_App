import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUsers } from 'react-icons/fa';
import TeamService, { type TeamMemberDto } from '../../ApiServices/services/TeamService';
import { useToast } from '../../hooks/use-toast';
import { BASE_URL } from '../../ApiServices/config/api.config';

interface TeamMemberData {
  id: number;
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
  specializationsDe?: string;
  specializationsTr?: string;
  specializationsEn?: string;
  specializationsAr?: string;
  languagesDe?: string;
  languagesTr?: string;
  languagesEn?: string;
  languagesAr?: string;
  achievementsDe?: string;
  achievementsTr?: string;
  achievementsEn?: string;
  achievementsAr?: string;
  displayOrder: number;
  isActive: boolean;
  canProvideConsultation?: boolean;
  consultationPrice?: number;
  consultationCurrency?: string;
  createdAt: string;
  updatedAt?: string;
}

const TeamMembers: React.FC = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberData | null>(null);
  const [formData, setFormData] = useState<TeamMemberDto>({
    name: '',
    slug: '',
    imageUrl: '',
    email: '',
    phone: '',
    experience: '',
    positionDe: '',
    positionTr: '',
    positionEn: '',
    positionAr: '',
    locationDe: '',
    locationTr: '',
    locationEn: '',
    locationAr: '',
    educationDe: '',
    educationTr: '',
    educationEn: '',
    educationAr: '',
    bioDe: '',
    bioTr: '',
    bioEn: '',
    bioAr: '',
    philosophyDe: '',
    philosophyTr: '',
    philosophyEn: '',
    philosophyAr: '',
    specializationsDe: [],
    specializationsTr: [],
    specializationsEn: [],
    specializationsAr: [],
    languagesDe: [],
    languagesTr: [],
    languagesEn: [],
    languagesAr: [],
    achievementsDe: [],
    achievementsTr: [],
    achievementsEn: [],
    achievementsAr: [],
    displayOrder: 0,
    isActive: true,
    canProvideConsultation: false,
    consultationPrice: undefined,
    consultationCurrency: 'EUR',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Helper function to get full image URL
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL starts with /, prepend BASE_URL
    if (url.startsWith('/')) {
      return `${BASE_URL}${url}`;
    }
    // Otherwise, assume it's a relative path and add BASE_URL with /
    return `${BASE_URL}/${url}`;
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await TeamService.getAllTeamMembers();
      if (res.success) {
        setMembers(res.items || []);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Ekip üyeleri yüklenemedi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      slug: '',
      imageUrl: '',
      email: '',
      phone: '',
      experience: '',
      positionDe: '',
      positionTr: '',
      positionEn: '',
      positionAr: '',
      locationDe: '',
      locationTr: '',
      locationEn: '',
      locationAr: '',
      educationDe: '',
      educationTr: '',
      educationEn: '',
      educationAr: '',
      bioDe: '',
      bioTr: '',
      bioEn: '',
      bioAr: '',
      philosophyDe: '',
      philosophyTr: '',
      philosophyEn: '',
      philosophyAr: '',
      specializationsDe: [],
      specializationsTr: [],
      specializationsEn: [],
      specializationsAr: [],
      languagesDe: [],
      languagesTr: [],
      languagesEn: [],
      languagesAr: [],
      achievementsDe: [],
      achievementsTr: [],
      achievementsEn: [],
      achievementsAr: [],
      displayOrder: 0,
      isActive: true,
      canProvideConsultation: false,
      consultationPrice: undefined,
      consultationCurrency: 'EUR',
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Geçersiz dosya tipi. İzin verilen tipler: jpg, jpeg, png, gif, webp',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Dosya boyutu 5MB\'dan büyük olamaz.',
      });
      return;
    }

    try {
      setUploadingImage(true);
      const res = await TeamService.uploadImage(file);
      if (res.success && res.imageUrl) {
        setFormData({ ...formData, imageUrl: res.imageUrl });
        setImagePreview(res.imageUrl);
        toast({
          variant: 'default',
          title: '✅ Başarılı',
          description: 'Görsel başarıyla yüklendi.',
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: error.message || 'Görsel yüklenemedi.',
      });
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleEdit = (member: TeamMemberData) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      slug: member.slug,
      imageUrl: member.imageUrl,
      email: member.email,
      phone: member.phone || '',
      experience: member.experience,
      positionDe: member.positionDe,
      positionTr: member.positionTr,
      positionEn: member.positionEn || '',
      positionAr: member.positionAr || '',
      locationDe: member.locationDe,
      locationTr: member.locationTr,
      locationEn: member.locationEn || '',
      locationAr: member.locationAr || '',
      educationDe: member.educationDe,
      educationTr: member.educationTr,
      educationEn: member.educationEn || '',
      educationAr: member.educationAr || '',
      bioDe: member.bioDe,
      bioTr: member.bioTr,
      bioEn: member.bioEn || '',
      bioAr: member.bioAr || '',
      philosophyDe: member.philosophyDe || '',
      philosophyTr: member.philosophyTr || '',
      philosophyEn: member.philosophyEn || '',
      philosophyAr: member.philosophyAr || '',
      specializationsDe: member.specializationsDe ? JSON.parse(member.specializationsDe) : [],
      specializationsTr: member.specializationsTr ? JSON.parse(member.specializationsTr) : [],
      specializationsEn: member.specializationsEn ? JSON.parse(member.specializationsEn) : [],
      specializationsAr: member.specializationsAr ? JSON.parse(member.specializationsAr) : [],
      languagesDe: member.languagesDe ? JSON.parse(member.languagesDe) : [],
      languagesTr: member.languagesTr ? JSON.parse(member.languagesTr) : [],
      languagesEn: member.languagesEn ? JSON.parse(member.languagesEn) : [],
      languagesAr: member.languagesAr ? JSON.parse(member.languagesAr) : [],
      achievementsDe: member.achievementsDe ? JSON.parse(member.achievementsDe) : [],
      achievementsTr: member.achievementsTr ? JSON.parse(member.achievementsTr) : [],
      achievementsEn: member.achievementsEn ? JSON.parse(member.achievementsEn) : [],
      achievementsAr: member.achievementsAr ? JSON.parse(member.achievementsAr) : [],
      displayOrder: member.displayOrder,
      isActive: member.isActive,
      canProvideConsultation: member.canProvideConsultation || false,
      consultationPrice: member.consultationPrice,
      consultationCurrency: member.consultationCurrency || 'EUR',
    });
    setImagePreview(getImageUrl(member.imageUrl));
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ekip üyesini silmek istediğinize emin misiniz?')) return;

    try {
      await TeamService.deleteTeamMember(id);
      toast({
        variant: 'default',
        title: '✅ Başarılı',
        description: 'Ekip üyesi silindi.',
      });
      loadMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Ekip üyesi silinemedi.',
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API - convert arrays to JSON strings
      const apiData: TeamMemberDto = {
        ...formData,
        specializationsDe: formData.specializationsDe && formData.specializationsDe.length > 0 
          ? JSON.stringify(formData.specializationsDe) 
          : undefined,
        specializationsTr: formData.specializationsTr && formData.specializationsTr.length > 0 
          ? JSON.stringify(formData.specializationsTr) 
          : undefined,
        specializationsEn: formData.specializationsEn && formData.specializationsEn.length > 0 
          ? JSON.stringify(formData.specializationsEn) 
          : undefined,
        specializationsAr: formData.specializationsAr && formData.specializationsAr.length > 0 
          ? JSON.stringify(formData.specializationsAr) 
          : undefined,
        languagesDe: formData.languagesDe && formData.languagesDe.length > 0 
          ? JSON.stringify(formData.languagesDe) 
          : undefined,
        languagesTr: formData.languagesTr && formData.languagesTr.length > 0 
          ? JSON.stringify(formData.languagesTr) 
          : undefined,
        languagesEn: formData.languagesEn && formData.languagesEn.length > 0 
          ? JSON.stringify(formData.languagesEn) 
          : undefined,
        languagesAr: formData.languagesAr && formData.languagesAr.length > 0 
          ? JSON.stringify(formData.languagesAr) 
          : undefined,
        achievementsDe: formData.achievementsDe && formData.achievementsDe.length > 0 
          ? JSON.stringify(formData.achievementsDe) 
          : undefined,
        achievementsTr: formData.achievementsTr && formData.achievementsTr.length > 0 
          ? JSON.stringify(formData.achievementsTr) 
          : undefined,
        achievementsEn: formData.achievementsEn && formData.achievementsEn.length > 0 
          ? JSON.stringify(formData.achievementsEn) 
          : undefined,
        achievementsAr: formData.achievementsAr && formData.achievementsAr.length > 0 
          ? JSON.stringify(formData.achievementsAr) 
          : undefined,
      };

      if (editingMember) {
        await TeamService.updateTeamMember(editingMember.id, apiData);
        toast({
          variant: 'default',
          title: '✅ Başarılı',
          description: 'Ekip üyesi güncellendi.',
        });
      } else {
        await TeamService.createTeamMember(apiData);
        toast({
          variant: 'default',
          title: '✅ Başarılı',
          description: 'Ekip üyesi eklendi.',
        });
      }
      setShowModal(false);
      loadMembers();
    } catch (error: any) {
      console.error('Error saving team member:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: error.message || 'Ekip üyesi kaydedilemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: 'specializations' | 'languages' | 'achievements', lang: 'De' | 'Tr' | 'En' | 'Ar', value: string) => {
    const langLower = lang === 'De' ? 'De' : lang === 'Tr' ? 'Tr' : lang === 'En' ? 'En' : 'Ar';
    const key = `${field}${langLower}` as keyof TeamMemberDto;
    const current = (formData[key] as string[]) || [];
    if (value.trim()) {
      setFormData({
        ...formData,
        [key]: [...current, value.trim()],
      });
    }
  };

  const removeArrayItem = (field: 'specializations' | 'languages' | 'achievements', lang: 'De' | 'Tr' | 'En' | 'Ar', index: number) => {
    const langLower = lang === 'De' ? 'De' : lang === 'Tr' ? 'Tr' : lang === 'En' ? 'En' : 'Ar';
    const key = `${field}${langLower}` as keyof TeamMemberDto;
    const current = (formData[key] as string[]) || [];
    setFormData({
      ...formData,
      [key]: current.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">Ekip Üyeleri</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          <FaPlus /> Yeni Ekle
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-300">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sıra</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Resim</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">İsim</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Durum</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {members.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Henüz ekip üyesi eklenmemiş.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{member.displayOrder}</td>
                  <td className="px-4 py-3">
                    <img src={getImageUrl(member.imageUrl)} alt={member.name} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{member.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${member.isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {member.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-300"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                  {editingMember ? 'Ekip Üyesi Düzenle' : 'Yeni Ekip Üyesi'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İsim *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Görsel *</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        {uploadingImage && (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        )}
                      </div>
                      {(imagePreview || formData.imageUrl) && (
                        <div className="mt-2">
                          <img
                            src={getImageUrl(imagePreview || formData.imageUrl)}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, imageUrl: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        placeholder="veya görsel URL'si girin"
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deneyim *</label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="15+"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sıra</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded"
                      />
                      Aktif
                    </label>
                  </div>
                </div>

                {/* Consultation/Appointment Settings */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Randevu / Danışmanlık Ayarları</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.canProvideConsultation || false}
                          onChange={(e) => setFormData({ ...formData, canProvideConsultation: e.target.checked })}
                          className="rounded"
                        />
                        Danışmanlık Verebilir
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Bu seçenek aktifse, bu kişi randevu alabilir sayfasında görünecektir.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Randevu Ücreti
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.consultationPrice || ''}
                        onChange={(e) => setFormData({ ...formData, consultationPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                        disabled={!formData.canProvideConsultation}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="50.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Döviz Cinsi
                      </label>
                      <select
                        value={formData.consultationCurrency || 'EUR'}
                        onChange={(e) => setFormData({ ...formData, consultationCurrency: e.target.value })}
                        disabled={!formData.canProvideConsultation}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="TRY">TRY (₺)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CHF">CHF (Fr)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Position */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Pozisyon</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DE *</label>
                      <input
                        type="text"
                        value={formData.positionDe}
                        onChange={(e) => setFormData({ ...formData, positionDe: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TR *</label>
                      <input
                        type="text"
                        value={formData.positionTr}
                        onChange={(e) => setFormData({ ...formData, positionTr: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EN</label>
                      <input
                        type="text"
                        value={formData.positionEn}
                        onChange={(e) => setFormData({ ...formData, positionEn: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AR</label>
                      <input
                        type="text"
                        value={formData.positionAr}
                        onChange={(e) => setFormData({ ...formData, positionAr: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Konum</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DE *</label>
                      <input
                        type="text"
                        value={formData.locationDe}
                        onChange={(e) => setFormData({ ...formData, locationDe: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TR *</label>
                      <input
                        type="text"
                        value={formData.locationTr}
                        onChange={(e) => setFormData({ ...formData, locationTr: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EN</label>
                      <input
                        type="text"
                        value={formData.locationEn}
                        onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AR</label>
                      <input
                        type="text"
                        value={formData.locationAr}
                        onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Eğitim</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DE *</label>
                      <textarea
                        value={formData.educationDe}
                        onChange={(e) => setFormData({ ...formData, educationDe: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TR *</label>
                      <textarea
                        value={formData.educationTr}
                        onChange={(e) => setFormData({ ...formData, educationTr: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EN</label>
                      <textarea
                        value={formData.educationEn}
                        onChange={(e) => setFormData({ ...formData, educationEn: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AR</label>
                      <textarea
                        value={formData.educationAr}
                        onChange={(e) => setFormData({ ...formData, educationAr: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Biyografi</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DE *</label>
                      <textarea
                        value={formData.bioDe}
                        onChange={(e) => setFormData({ ...formData, bioDe: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TR *</label>
                      <textarea
                        value={formData.bioTr}
                        onChange={(e) => setFormData({ ...formData, bioTr: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EN</label>
                      <textarea
                        value={formData.bioEn}
                        onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AR</label>
                      <textarea
                        value={formData.bioAr}
                        onChange={(e) => setFormData({ ...formData, bioAr: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Philosophy */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Felsefe</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DE</label>
                      <textarea
                        value={formData.philosophyDe}
                        onChange={(e) => setFormData({ ...formData, philosophyDe: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TR</label>
                      <textarea
                        value={formData.philosophyTr}
                        onChange={(e) => setFormData({ ...formData, philosophyTr: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EN</label>
                      <textarea
                        value={formData.philosophyEn}
                        onChange={(e) => setFormData({ ...formData, philosophyEn: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AR</label>
                      <textarea
                        value={formData.philosophyAr}
                        onChange={(e) => setFormData({ ...formData, philosophyAr: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                {(['De', 'Tr', 'En', 'Ar'] as const).map((lang) => (
                  <div key={lang}>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Uzmanlık Alanları ({lang})</h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Yeni uzmanlık ekle..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('specializations', lang, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData[`specializations${lang}` as keyof TeamMemberDto] as string[])?.map((item, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                          {item}
                          <button onClick={() => removeArrayItem('specializations', lang, index)} className="text-blue-600 dark:text-blue-400">
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Languages */}
                {(['De', 'Tr', 'En', 'Ar'] as const).map((lang) => (
                  <div key={lang}>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Diller ({lang})</h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Yeni dil ekle..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('languages', lang, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData[`languages${lang}` as keyof TeamMemberDto] as string[])?.map((item, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                          {item}
                          <button onClick={() => removeArrayItem('languages', lang, index)} className="text-green-600 dark:text-green-400">
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Achievements */}
                {(['De', 'Tr', 'En', 'Ar'] as const).map((lang) => (
                  <div key={lang}>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Başarılar ({lang})</h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Yeni başarı ekle..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('achievements', lang, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData[`achievements${lang}` as keyof TeamMemberDto] as string[])?.map((item, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                          {item}
                          <button onClick={() => removeArrayItem('achievements', lang, index)} className="text-purple-600 dark:text-purple-400">
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300 flex items-center gap-2"
                >
                  <FaSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;

