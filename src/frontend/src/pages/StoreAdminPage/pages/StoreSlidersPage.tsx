import { useEffect, useState, useCallback } from 'react';
import { FaImages, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { Switch } from '../../../shared/ui/Switch/Switch';
import { ImageUploadField } from '../../../shared/ui/ImageUploadField/ImageUploadField';
import { apiClient, uploadStoreImage } from '../../../shared/api/axiosConfig';
import s from './storeAdmin.shared.module.css';

interface SliderSlideDto {
  id: string;
  sliderId: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonUrl?: string;
  sortOrder: number;
}

interface SliderDto {
  id: string;
  name: string;
  autoPlay: boolean;
  autoPlayInterval: number;
  showDots: boolean;
  showArrows: boolean;
  isActive: boolean;
  createdAt: string;
  slides: SliderSlideDto[];
}

interface SliderFormData {
  name: string;
  autoPlay: boolean;
  autoPlayInterval: number;
  showDots: boolean;
  showArrows: boolean;
  isActive: boolean;
}

interface SlideFormData {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  sortOrder: number;
}

const EMPTY_SLIDER_FORM: SliderFormData = {
  name: '',
  autoPlay: true,
  autoPlayInterval: 4000,
  showDots: true,
  showArrows: true,
  isActive: true,
};

const EMPTY_SLIDE_FORM: SlideFormData = {
  imageUrl: '',
  title: '',
  subtitle: '',
  buttonText: '',
  buttonUrl: '',
  sortOrder: 0,
};

export const StoreSlidersPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [editingSliderId, setEditingSliderId] = useState<string | null>(null);
  const [sliderForm, setSliderForm] = useState<SliderFormData>(EMPTY_SLIDER_FORM);
  const [isSavingSlider, setIsSavingSlider] = useState(false);
  const [confirmDeleteSliderId, setConfirmDeleteSliderId] = useState<string | null>(null);

  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [addingSlideToSliderId, setAddingSlideToSliderId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState<SlideFormData>(EMPTY_SLIDE_FORM);
  const [pendingSlideFile, setPendingSlideFile] = useState<File | null>(null);
  const [isSavingSlide, setIsSavingSlide] = useState(false);
  const [confirmDeleteSlide, setConfirmDeleteSlide] = useState<{ sliderId: string; slideId: string } | null>(null);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchSliders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ items: SliderDto[] }>('/store-admin/sliders');
      setSliders(res.data.items ?? []);
    } catch {
      toast.error('Slaytlar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchSliders(); }, [fetchSliders]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openCreateSlider = () => { setEditingSliderId(null); setSliderForm(EMPTY_SLIDER_FORM); setIsSliderModalOpen(true); };

  const openEditSlider = (slider: SliderDto) => {
    setEditingSliderId(slider.id);
    setSliderForm({
      name: slider.name,
      autoPlay: slider.autoPlay,
      autoPlayInterval: slider.autoPlayInterval,
      showDots: slider.showDots,
      showArrows: slider.showArrows,
      isActive: slider.isActive,
    });
    setIsSliderModalOpen(true);
  };

  const closeSliderModal = () => { setIsSliderModalOpen(false); setEditingSliderId(null); setSliderForm(EMPTY_SLIDER_FORM); };

  const handleSaveSlider = async () => {
    if (!sliderForm.name.trim()) { toast.error('Slayt adı zorunludur.'); return; }
    setIsSavingSlider(true);
    try {
      const payload = { ...sliderForm, name: sliderForm.name.trim() };
      if (editingSliderId) {
        await apiClient.put(`/store-admin/sliders/${editingSliderId}`, { id: editingSliderId, ...payload });
        toast.success('Slayt güncellendi.');
      } else {
        await apiClient.post('/store-admin/sliders', payload);
        toast.success('Slayt oluşturuldu.');
      }
      closeSliderModal();
      void fetchSliders();
    } catch {
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setIsSavingSlider(false);
    }
  };

  const handleDeleteSlider = async (id: string) => {
    try {
      await apiClient.delete(`/store-admin/sliders/${id}`);
      toast.success('Slayt silindi.');
      setConfirmDeleteSliderId(null);
      void fetchSliders();
    } catch {
      toast.error('Slayt silinemedi.');
    }
  };

  const openAddSlide = (sliderId: string) => {
    setAddingSlideToSliderId(sliderId);
    setSlideForm(EMPTY_SLIDE_FORM);
    setPendingSlideFile(null);
    setIsSlideModalOpen(true);
  };

  const closeSlideModal = () => { setIsSlideModalOpen(false); setAddingSlideToSliderId(null); setSlideForm(EMPTY_SLIDE_FORM); setPendingSlideFile(null); };

  const handleSaveSlide = async () => {
    if (!slideForm.imageUrl && !pendingSlideFile) { toast.error('Görsel zorunludur.'); return; }
    if (!addingSlideToSliderId) return;
    setIsSavingSlide(true);
    try {
      let imageUrl = slideForm.imageUrl.startsWith('blob:') ? '' : slideForm.imageUrl.trim();
      if (pendingSlideFile) {
        imageUrl = await uploadStoreImage(pendingSlideFile);
        setPendingSlideFile(null);
      }
      const payload = {
        imageUrl,
        title: slideForm.title.trim() || null,
        subtitle: slideForm.subtitle.trim() || null,
        buttonText: slideForm.buttonText.trim() || null,
        buttonUrl: slideForm.buttonUrl.trim() || null,
        sortOrder: slideForm.sortOrder,
      };
      await apiClient.post(`/store-admin/sliders/${addingSlideToSliderId}/slides`, payload);
      toast.success('Slayt görseli eklendi.');
      closeSlideModal();
      void fetchSliders();
    } catch {
      toast.error('Slayt görseli eklenemedi.');
    } finally {
      setIsSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (sliderId: string, slideId: string) => {
    try {
      await apiClient.delete(`/store-admin/sliders/${sliderId}/slides/${slideId}`);
      toast.success('Slayt görseli silindi.');
      setConfirmDeleteSlide(null);
      void fetchSliders();
    } catch {
      toast.error('Slayt görseli silinemedi.');
    }
  };

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaImages className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Slayt Gösterileri</h2>
            <p className={s.pageSubtitle}>Görsel slayt gösterilerini yönetin</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreateSlider}>
          <FaPlus />
          Yeni Slayt
        </Button>
      </div>

      {isLoading ? (
        <p className={s.muted}>Yükleniyor...</p>
      ) : sliders.length === 0 ? (
        <p className={s.muted}>Henüz slayt eklenmemiş.</p>
      ) : (
        <div className={s.cardList}>
          {sliders.map((slider) => {
            const isExpanded = expandedIds.has(slider.id);
            return (
              <div key={slider.id} className={s.sliderCard}>
                <div className={s.cardHeader}>
                  <button type="button" className={s.expandBtn} onClick={() => toggleExpanded(slider.id)}>
                    <span className={s.expandIcon}>
                      {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                    <div className={s.cardInfo}>
                      <span className={s.sliderName}>{slider.name}</span>
                      <span className={s.sliderMeta}>
                        {slider.slides.length} görsel
                        {slider.autoPlay ? ` · ${slider.autoPlayInterval / 1000}s` : ''}
                      </span>
                    </div>
                    <span className={slider.isActive ? s.badgeActive : s.badgeInactive}>
                      {slider.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </button>
                  <div className={s.cardActions}>
                    <button type="button" className={s.editBtnCard} onClick={() => openEditSlider(slider)} title="Düzenle">
                      <FaEdit />
                    </button>
                    <button type="button" className={s.deleteBtnCard} onClick={() => setConfirmDeleteSliderId(slider.id)} title="Sil">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className={s.slidesPanel}>
                    <div className={s.slidesHeader}>
                      <span className={s.slidesTitle}>Görseller</span>
                      <button type="button" className={s.addSlideBtn} onClick={() => openAddSlide(slider.id)}>
                        <FaPlus />
                        Görsel Ekle
                      </button>
                    </div>
                    {slider.slides.length === 0 ? (
                      <p className={s.noSlides}>Henüz görsel eklenmemiş.</p>
                    ) : (
                      <div className={s.slidesList}>
                        {slider.slides.map((slide) => (
                          <div key={slide.id} className={s.slideItem}>
                            <div className={s.slideThumb}>
                              {slide.imageUrl
                                ? <img src={slide.imageUrl} alt={slide.title ?? 'Slayt'} />
                                : <div className={s.slideThumbEmpty} />}
                            </div>
                            <div className={s.slideInfo}>
                              <span className={s.slideTitle}>{slide.title || '(Başlıksız)'}</span>
                              {slide.subtitle && <span className={s.slideSub}>{slide.subtitle}</span>}
                            </div>
                            <button type="button" className={s.deleteBtnCard} onClick={() => setConfirmDeleteSlide({ sliderId: slider.id, slideId: slide.id })} title="Görseli Sil">
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isSliderModalOpen}
        onClose={closeSliderModal}
        title={editingSliderId ? 'Slayt Düzenle' : 'Yeni Slayt'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeSliderModal}>İptal</Button>
            <Button variant="primary" isLoading={isSavingSlider} onClick={() => void handleSaveSlider()}>Kaydet</Button>
          </>
        }
      >
        <Input
          label="Slayt Adı *"
          value={sliderForm.name}
          onChange={(e) => setSliderForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Ana Sayfa Slaytı"
        />
        <div style={{ marginTop: 12 }}>
          <Input
            label="Otomatik Oynatma Aralığı (ms)"
            type="number"
            value={String(sliderForm.autoPlayInterval)}
            onChange={(e) => setSliderForm((p) => ({ ...p, autoPlayInterval: parseInt(e.target.value, 10) || 4000 }))}
            min="1000"
          />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          <Switch label="Otomatik Oynat" checked={sliderForm.autoPlay} onChange={(e) => setSliderForm((p) => ({ ...p, autoPlay: e.target.checked }))} />
          <Switch label="Noktalar" checked={sliderForm.showDots} onChange={(e) => setSliderForm((p) => ({ ...p, showDots: e.target.checked }))} />
          <Switch label="Oklar" checked={sliderForm.showArrows} onChange={(e) => setSliderForm((p) => ({ ...p, showArrows: e.target.checked }))} />
          <Switch label="Aktif" checked={sliderForm.isActive} onChange={(e) => setSliderForm((p) => ({ ...p, isActive: e.target.checked }))} />
        </div>
      </Modal>

      <Modal
        isOpen={isSlideModalOpen}
        onClose={closeSlideModal}
        title="Görsel Ekle"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeSlideModal}>İptal</Button>
            <Button variant="primary" isLoading={isSavingSlide} onClick={() => void handleSaveSlide()}>Ekle</Button>
          </>
        }
      >
        <div className={s.formRow}>
          <ImageUploadField
            label="Slayt Görseli *"
            value={slideForm.imageUrl}
            onChange={(url) => setSlideForm((p) => ({ ...p, imageUrl: url }))}
            onFileStaged={(f) => setPendingSlideFile(f)}
            aspectRatio="banner"
          />
        </div>
        <div className={s.formGrid} style={{ marginTop: 12 }}>
          <Input
            label="Başlık"
            value={slideForm.title}
            onChange={(e) => setSlideForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="İsteğe bağlı başlık"
          />
          <Input
            label="Alt Başlık"
            value={slideForm.subtitle}
            onChange={(e) => setSlideForm((p) => ({ ...p, subtitle: e.target.value }))}
            placeholder="İsteğe bağlı"
          />
        </div>
        <div className={s.formGrid}>
          <Input
            label="Buton Metni"
            value={slideForm.buttonText}
            onChange={(e) => setSlideForm((p) => ({ ...p, buttonText: e.target.value }))}
            placeholder="Ör: Keşfet"
          />
          <Input
            label="Buton URL"
            type="url"
            value={slideForm.buttonUrl}
            onChange={(e) => setSlideForm((p) => ({ ...p, buttonUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>
        <Input
          label="Sıra"
          type="number"
          value={String(slideForm.sortOrder)}
          onChange={(e) => setSlideForm((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))}
        />
      </Modal>

      <Modal
        isOpen={!!confirmDeleteSliderId}
        onClose={() => setConfirmDeleteSliderId(null)}
        title="Slaytı Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteSliderId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => confirmDeleteSliderId && void handleDeleteSlider(confirmDeleteSliderId)}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu slaytı ve tüm görsellerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
      </Modal>

      <Modal
        isOpen={!!confirmDeleteSlide}
        onClose={() => setConfirmDeleteSlide(null)}
        title="Görseli Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteSlide(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => confirmDeleteSlide && void handleDeleteSlide(confirmDeleteSlide.sliderId, confirmDeleteSlide.slideId)}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu görseli silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
};
