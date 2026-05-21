import type { DataSchema } from '../types';

export const mockDataSchema: DataSchema[] = [
  {
    entity: 'Müşteri',
    label: 'Müşteri',
    icon: '👤',
    fields: [
      { entity: 'Müşteri', field: 'Ad', label: 'Ad', type: 'string' },
      { entity: 'Müşteri', field: 'Soyad', label: 'Soyad', type: 'string' },
      { entity: 'Müşteri', field: 'Email', label: 'E-posta', type: 'string' },
      { entity: 'Müşteri', field: 'Telefon', label: 'Telefon', type: 'string' },
      { entity: 'Müşteri', field: 'Adres', label: 'Adres', type: 'string' },
    ],
  },
  {
    entity: 'Sipariş',
    label: 'Sipariş',
    icon: '🧾',
    fields: [
      { entity: 'Sipariş', field: 'SiparisNo', label: 'Sipariş No', type: 'string' },
      { entity: 'Sipariş', field: 'Tarih', label: 'Tarih', type: 'date' },
      { entity: 'Sipariş', field: 'Toplam', label: 'Toplam Tutar', type: 'currency' },
      { entity: 'Sipariş', field: 'KDV', label: 'KDV', type: 'currency' },
      { entity: 'Sipariş', field: 'Durum', label: 'Durum', type: 'string' },
    ],
  },
  {
    entity: 'Ürün',
    label: 'Ürün',
    icon: '📦',
    fields: [
      { entity: 'Ürün', field: 'Ad', label: 'Ürün Adı', type: 'string' },
      { entity: 'Ürün', field: 'Kod', label: 'Ürün Kodu', type: 'string' },
      { entity: 'Ürün', field: 'Fiyat', label: 'Fiyat', type: 'currency' },
      { entity: 'Ürün', field: 'Miktar', label: 'Miktar', type: 'number' },
      { entity: 'Ürün', field: 'Birim', label: 'Birim', type: 'string' },
    ],
  },
  {
    entity: 'Sayfa',
    label: 'Sistem',
    icon: '⚙️',
    fields: [
      { entity: 'Sayfa', field: 'SayfaNo', label: 'Sayfa Numarası', type: 'number' },
      { entity: 'Sayfa', field: 'ToplamSayfa', label: 'Toplam Sayfa', type: 'number' },
      { entity: 'Sayfa', field: 'Tarih', label: 'Yazdırma Tarihi', type: 'date' },
    ],
  },
];
