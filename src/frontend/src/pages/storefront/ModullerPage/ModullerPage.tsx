import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './ModullerPage.module.css';

/* ── Per-module SVG icons ── */
const ICONS: Record<string, React.ReactNode> = {
  eticaret: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  crm: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  email: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  sms: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  seo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  social: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  marketplace: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  affiliate: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  personel: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  izin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bordro: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="12" cy="13" r="3"/></svg>,
  performans: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>,
  iseAlim: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  muhasebe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  fatura: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  gelirGider: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  kdv: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="9" y1="14" x2="15" y2="14"/></svg>,
  butce: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-5"/></svg>,
  stok: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7 12 3 4 7v10l8 4 8-4z"/></svg>,
  depo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/></svg>,
  kargo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  barkod: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="11" y1="8" x2="11" y2="16"/><line x1="15" y1="8" x2="15" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/></svg>,
  tedarik: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 9v6c0 1.5 1 3 3 3h6c2 0 3-1.5 3-3"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>,
  ticket: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  kb: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  callcenter: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-2.02a2 2 0 0 1 2.11-.45c1 .35 2.01.59 3.06.72A2 2 0 0 1 22 16.92z"/></svg>,
  planning: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>,
  bom: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></svg>,
  kalite: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6z"/></svg>,
  bakim: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  notes: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
  tasks: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  meetings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  docs: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
};

function getIcon(id: string) {
  return ICONS[id] ?? ICONS.docs;
}

type Mod = { id: string; name: string; cat: string; price: number; desc: string; tag?: string };

const FEATURED: Mod[] = [
  { id: 'eticaret', name: 'E-Ticaret', cat: 'satis', price: 499, desc: 'Online mağaza, ürün, sipariş, stok ve tema editörü. Mağazanızı dakikalar içinde açın.', tag: 'popular' },
  { id: 'crm', name: 'CRM', cat: 'satis', price: 399, desc: 'Müşteri ilişkileri, fırsat yönetimi, kampanyalar. 360° müşteri profili tek panelde.', tag: 'popular' },
  { id: 'muhasebe', name: 'Muhasebe', cat: 'finans', price: 349, desc: 'E-fatura, gelir-gider, KDV beyannamesi. GİB entegrasyonu ile uyumlu.', tag: 'new' },
];

type CatDef = { id: string; label: string; desc: string; color: string; mods: Mod[] };

const CATS: CatDef[] = [
  { id: 'satis', label: 'Satış & Pazarlama', desc: 'Mağaza, müşteri, kampanya — satış hattını uçtan uca yönetin.', color: '#8b5cf6', mods: [
    { id: 'eticaret', name: 'E-Ticaret', cat: 'satis', price: 499, desc: 'Online mağaza, ürün, sipariş, stok yönetimi', tag: 'popular' },
    { id: 'crm', name: 'CRM', cat: 'satis', price: 399, desc: 'Müşteri yönetimi, fırsat takibi, kampanyalar', tag: 'popular' },
    { id: 'email', name: 'E-posta Pazarlama', cat: 'satis', price: 199, desc: 'Kampanya tasarımı, otomasyonlar, A/B test' },
    { id: 'sms', name: 'SMS Pazarlama', cat: 'satis', price: 149, desc: 'Toplu SMS, OTP, kampanya bildirimleri' },
    { id: 'seo', name: 'SEO Yöneticisi', cat: 'satis', price: 249, desc: 'Anahtar kelime takibi, meta yönetimi, sitemap', tag: 'new' },
    { id: 'social', name: 'Sosyal Medya', cat: 'satis', price: 199, desc: 'Instagram, Facebook, X — planla & yayınla' },
    { id: 'marketplace', name: 'Pazaryeri', cat: 'satis', price: 299, desc: 'Trendyol, Hepsiburada, N11 senkronizasyonu' },
    { id: 'affiliate', name: 'Affiliate', cat: 'satis', price: 179, desc: 'Partner ağı, komisyon takibi, link üretici', tag: 'beta' },
  ]},
  { id: 'ik', label: 'İnsan Kaynakları', desc: 'Personel, izin, bordro ve performans yönetimi.', color: '#06b6d4', mods: [
    { id: 'personel', name: 'Personel Yönetimi', cat: 'ik', price: 299, desc: 'Sicil, özlük, organizasyon şeması' },
    { id: 'izin', name: 'İzin & Vardiya', cat: 'ik', price: 149, desc: 'Onay akışı, takvim, fazla mesai' },
    { id: 'bordro', name: 'Bordro & SGK', cat: 'ik', price: 249, desc: 'Otomatik bordro, SGK e-bildirge' },
    { id: 'performans', name: 'Performans', cat: 'ik', price: 199, desc: '360° değerlendirme, OKR/KPI takibi' },
    { id: 'iseAlim', name: 'İşe Alım (ATS)', cat: 'ik', price: 179, desc: 'Pozisyon, başvuru havuzu, mülakat' },
  ]},
  { id: 'finans', label: 'Finans', desc: 'Muhasebe, fatura, KDV — finansal süreçlerin tamamı.', color: '#10b981', mods: [
    { id: 'muhasebe', name: 'Muhasebe', cat: 'finans', price: 349, desc: 'E-fatura, ön muhasebe, GİB entegrasyonu', tag: 'new' },
    { id: 'fatura', name: 'Fatura Yönetimi', cat: 'finans', price: 149, desc: 'E-fatura, e-arşiv, otomatik takip' },
    { id: 'gelirGider', name: 'Gelir-Gider', cat: 'finans', price: 99, desc: 'Kasa, banka, nakit akışı görselleri' },
    { id: 'kdv', name: 'KDV Beyannamesi', cat: 'finans', price: 149, desc: 'Otomatik KDV-1/2 hazırlama, BA-BS' },
    { id: 'butce', name: 'Bütçe & Tahmin', cat: 'finans', price: 199, desc: 'Aylık bütçe, sapma analizi, forecast' },
  ]},
  { id: 'stok', label: 'Stok & Lojistik', desc: 'Stok, depo, kargo, barkod — operasyonun fiziksel akışı.', color: '#f59e0b', mods: [
    { id: 'stok', name: 'Stok Yönetimi', cat: 'stok', price: 199, desc: 'Çoklu lokasyon, sayım, kritik seviye uyarı' },
    { id: 'depo', name: 'Depo & Lokasyon', cat: 'stok', price: 149, desc: 'Raf, koridor bazlı yerleşim, transfer' },
    { id: 'kargo', name: 'Kargo Entegrasyonu', cat: 'stok', price: 129, desc: 'Aras, Yurtiçi, MNG, PTT — etiket basma' },
    { id: 'barkod', name: 'Barkod & Etiket', cat: 'stok', price: 99, desc: 'QR, barkod tasarımı, toplu yazdırma' },
    { id: 'tedarik', name: 'Tedarik Zinciri', cat: 'stok', price: 249, desc: 'Tedarikçi, sipariş tahminleri, lead time', tag: 'beta' },
  ]},
  { id: 'destek', label: 'Müşteri Hizmetleri', desc: 'Müşteri destek operasyonu için araçlar.', color: '#ec4899', mods: [
    { id: 'chat', name: 'Canlı Destek', cat: 'destek', price: 129, desc: 'Mağazanıza chat balonu, agent yönetimi' },
    { id: 'ticket', name: 'Bilet Sistemi', cat: 'destek', price: 149, desc: 'SLA, atama, kategoriler, otomasyon' },
    { id: 'kb', name: 'Bilgi Bankası', cat: 'destek', price: 79, desc: 'Public FAQ, makale yönetimi, arama' },
    { id: 'callcenter', name: 'Çağrı Merkezi', cat: 'destek', price: 299, desc: 'VoIP, IVR, çağrı kayıtları, anketler', tag: 'coming' },
  ]},
  { id: 'uretim', label: 'Üretim & Operasyon', desc: 'Üretim atölyeleri için planlama, kalite ve bakım modülleri.', color: '#ef4444', mods: [
    { id: 'planning', name: 'Üretim Planlama', cat: 'uretim', price: 299, desc: 'İş emri, kapasite, Gantt görselleri' },
    { id: 'bom', name: 'BOM & Reçete', cat: 'uretim', price: 199, desc: 'Hammadde tüketim, çok seviyeli reçete' },
    { id: 'kalite', name: 'Kalite Kontrol', cat: 'uretim', price: 179, desc: 'Checklist, hata kategorileri, raporlar' },
    { id: 'bakim', name: 'Bakım Yönetimi', cat: 'uretim', price: 149, desc: 'Periyodik bakım, arıza kayıtları' },
  ]},
  { id: 'verim', label: 'Verimlilik', desc: 'Ekip çalışma araçları — notlar, görevler, dokümanlar.', color: '#6366f1', mods: [
    { id: 'notes', name: 'Notlar', cat: 'verim', price: 79, desc: 'Ekip notları, etiketleme, arama' },
    { id: 'tasks', name: 'Görev Takibi', cat: 'verim', price: 99, desc: 'Kanban, sprint, atama, bağımlılıklar' },
    { id: 'meetings', name: 'Toplantı Yönetimi', cat: 'verim', price: 129, desc: 'Takvim, ajanda, otomatik notlar' },
    { id: 'docs', name: 'Belge Yönetimi', cat: 'verim', price: 99, desc: 'Sözleşmeler, izinler, versiyonlama' },
  ]},
];

const TB_CATS = [
  { id: 'all', label: 'Tümü', cnt: 35 },
  { id: 'satis', label: 'Satış & Pazarlama', cnt: 8 },
  { id: 'ik', label: 'İnsan Kaynakları', cnt: 5 },
  { id: 'finans', label: 'Finans', cnt: 5 },
  { id: 'stok', label: 'Stok & Lojistik', cnt: 5 },
  { id: 'destek', label: 'Müşteri Hizmetleri', cnt: 4 },
  { id: 'uretim', label: 'Üretim', cnt: 4 },
  { id: 'verim', label: 'Verimlilik', cnt: 4 },
];

function TagBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  if (tag === 'popular') return <span className={`${s.tag} ${s.tagPopular}`}>★ Popüler</span>;
  if (tag === 'new') return <span className={`${s.tag} ${s.tagNew}`}>Yeni</span>;
  if (tag === 'beta') return <span className={`${s.tag} ${s.tagBeta}`}>Beta</span>;
  if (tag === 'coming') return <span className={`${s.tag} ${s.tagComing}`}>Yakında</span>;
  return null;
}

export function ModullerPage() {
  useScrollReveal();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());

  const toggleAdd = (id: string) => {
    setAdded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Find prices for added modules
  const allMods = CATS.flatMap((c) => c.mods);
  const featMods = FEATURED;
  const allModsWithPrice = [...allMods, ...featMods];
  const selTotal = Array.from(added).reduce((sum, id) => {
    const mod = allModsWithPrice.find((m) => m.id === id);
    return sum + (mod?.price ?? 0);
  }, 0);

  const q = search.trim().toLowerCase();

  const visibleCats = CATS.filter((cat) => {
    if (filter !== 'all' && cat.id !== filter) return false;
    if (q) return cat.mods.some((m) => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
    return true;
  }).map((cat) => ({
    ...cat,
    mods: q ? cat.mods.filter((m) => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)) : cat.mods,
  }));

  const totalVisible = visibleCats.reduce((acc, c) => acc + c.mods.length, 0);

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Modül Kataloğu</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">35+ modül, <span className="lp-grad-text">sınırsız kombinasyon</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Sadece kullandığınız modüller için ödeyin. İhtiyacınız değiştiğinde tek tıkla açın/kapatın — kurulum yok.</p>
        </div>
      </section>

      <div className="lp-container">
        <div className={s.toolbar}>
          <div className={s.toolbarRow}>
            <div className={s.tbSearch}>
              <span className={s.tbSearchIc}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
              <input className={s.tbSearchInput} type="search" placeholder="Modül arayın..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className={s.tbCats}>
              {TB_CATS.map((tc) => (
                <button key={tc.id} className={`${s.tbBtn} ${filter === tc.id ? s.tbBtnOn : ''}`} onClick={() => setFilter(tc.id)}>
                  {tc.label} <span className={s.tbCnt}>{tc.cnt}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={s.tbSummary}>
            <div><strong>{totalVisible}</strong> modül gösteriliyor</div>
            {added.size > 0 && (
              <div className={s.selBar}>
                <b>{added.size}</b> modül seçili
                <span className={s.selDivider}>·</span>
                Aylık <b>₺{selTotal.toLocaleString('tr-TR')}</b>
                <button className={s.selClear} onClick={() => setAdded(new Set())}>Temizle</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured */}
      <section className={s.featured}>
        <div className="lp-container">
          <div className={s.featHead}>
            <h2 className={s.featTitle}>⭐ Popüler</h2>
            <span className={s.lbl}>En çok kullanılan 3 modül</span>
          </div>
          <div className={s.featGrid}>
            {FEATURED.map((f) => (
              <article key={f.id} className={`${s.featCard} lp-glass`} style={{ '--accent': f.cat === 'finans' ? '#6ee7b7' : '#c4b5fd', '--accent-soft': f.cat === 'finans' ? 'rgba(16,185,129,.2)' : 'rgba(139,92,246,.2)', '--accent-border': f.cat === 'finans' ? 'rgba(16,185,129,.4)' : 'rgba(139,92,246,.4)' } as React.CSSProperties}>
                <div className={s.featTop}>
                  <div className={s.featIc}>{getIcon(f.id)}</div>
                  <div><TagBadge tag={f.tag} /></div>
                </div>
                <h3 className={s.featH3}>{f.name}</h3>
                <p className={s.featP}>{f.desc}</p>
                <div className={s.featFoot}>
                  <div className={s.pricePill}><b>₺{f.price}</b><span>/ay</span></div>
                  <button
                    className={`${s.installBtn} ${added.has(f.id) ? s.installAdded : ''}`}
                    onClick={() => toggleAdd(f.id)}
                  >
                    {added.has(f.id) ? '✓ Eklendi' : 'Ekle'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Category sections */}
      <section className={s.cats}>
        <div className="lp-container">
          {visibleCats.length === 0 && (
            <div className={s.emptyState}>
              <div className={s.emptyIc}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
              <h4>Sonuç bulunamadı</h4>
              <p>Aramanız veya filtrenizle eşleşen modül yok.</p>
            </div>
          )}
          {visibleCats.map((cat) => (
            <div key={cat.id} className={s.catSection} id={cat.id}>
              <div className={s.catHead}>
                <div className={s.catTitle}>
                  <span className={s.catSwatch} style={{ background: cat.color, boxShadow: `0 0 12px ${cat.color}` }} />
                  <h2>{cat.label}</h2>
                  <span className={s.catCnt}>{cat.mods.length} modül</span>
                </div>
              </div>
              <p className={s.catDesc}>{cat.desc}</p>
              <div className={s.modGrid}>
                {cat.mods.map((mod) => (
                  <article
                    key={mod.id}
                    className={`${s.modCard} lp-glass`}
                    style={{ '--cat-color': cat.color, '--accent': cat.color + 'cc', '--accent-soft': cat.color + '26', '--accent-border': cat.color + '55' } as React.CSSProperties}
                  >
                    <div className={s.modRow}>
                      <div className={s.modIc}>{getIcon(mod.id)}</div>
                      <button
                        className={`${s.addBtn} ${added.has(mod.id) ? s.addBtnAdded : ''}`}
                        onClick={() => toggleAdd(mod.id)}
                        aria-label={added.has(mod.id) ? 'Kaldır' : 'Ekle'}
                      />
                    </div>
                    <h4 className={s.modName}>{mod.name} <TagBadge tag={mod.tag} /></h4>
                    <p className={s.modDesc}>{mod.desc}</p>
                    <div className={s.modFoot}>
                      <div className={s.modPrice}><b>₺{mod.price}</b><span>/ay</span></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bundles */}
      <section className={s.bundles}>
        <div className="lp-container">
          <div className={s.bundlesHead}>
            <span className="lp-eyebrow fade-up"><span className="lp-dot" />Hazır Paketler</span>
            <h2 className="fade-up" data-delay="1">35 modül fazla mı? <span className="lp-grad-text">Hazır paketle başlayın.</span></h2>
            <p className="fade-up" data-delay="2">Sektörünüze özel önerilmiş modül kombinasyonları. İstediğiniz an düzenleyin.</p>
          </div>
          <div className={s.bundleGrid}>
            {[
              { icons: ['🛒','📦','🚚'], title: 'E-Ticaret Paketi', count: '3 modül · E-Ticaret + Stok + Kargo', desc: 'Online satışa hızla başlamak isteyen mağazalar için.', price: '699', strike: '₺827', save: '−%15', delay: '0' },
              { icons: ['👥','📧','📱'], title: 'Satış & CRM Paketi', count: '3 modül · CRM + E-posta + SMS', desc: 'Müşteri ilişkileri ve pazarlamayı otomatikleştirin.', price: '599', strike: '₺747', save: '−%20', delay: '1' },
              { icons: ['👤','💼','📅'], title: 'İK Paketi', count: '3 modül · Personel + Bordro + İzin', desc: 'İK operasyonunu tek panelden yönetin.', price: '549', strike: '₺697', save: '−%21', delay: '2' },
              { icons: ['🌟','🛒','👥','💼','📊'], title: 'Tam Paket', count: '35 modül · Hepsi dahil', desc: 'Premium plana eşdeğer — Wixi\'nin tüm modülleri.', price: '1.299', strike: '₺6.500+', save: '−%80', delay: '3' },
            ].map((b) => (
              <article key={b.title} className={`${s.bundle} lp-glass fade-up`} data-delay={b.delay}>
                <div className={s.bundleIcons}>{b.icons.map((ic, i) => <span key={i}>{ic}</span>)}</div>
                <h3>{b.title}</h3>
                <span className={s.bundleCount}>{b.count}</span>
                <p>{b.desc}</p>
                <div className={s.bundlePrice}>
                  <span>₺</span><b>{b.price}</b><span>/ay</span>
                  <span className={s.bundleStrike}>{b.strike}</span>
                  <span className={s.bundleSave}>{b.save}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>İhtiyacınız olanı seçin. <span className="lp-grad-text">Hemen başlayın.</span></h2>
            <p>14 gün ücretsiz deneyin. İstediğiniz modülü ekleyip çıkartın — risk yok.</p>
            <div className={s.ctaBtns}>
              <a href="/register" className="lp-btn lp-btn--primary lp-btn--lg" data-magnet>Ücretsiz Başla →</a>
              <Link to="/fiyatlandirma" className="lp-btn lp-btn--ghost lp-btn--lg" data-magnet>Planları Gör</Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
