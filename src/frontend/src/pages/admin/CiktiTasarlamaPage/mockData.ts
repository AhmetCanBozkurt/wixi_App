export interface CiktiSablonu {
  id: number;
  ad: string;
  tip: string;
  varsayilan: boolean;
  icerik: string;
  aciklama?: string;
  olusturma_tarihi?: string;
  guncelleme_tarihi?: string;
}

export interface Yazici {
  id: number;
  ad: string;
  model?: string;
  aktif: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const dummyTemplates: CiktiSablonu[] = [
  {
    id: 1,
    ad: 'Standart Fatura',
    tip: 'fatura',
    varsayilan: true,
    icerik: JSON.stringify({
      elements: [
        {
          id: 'elem1',
          type: 'text',
          content: 'FATURA',
          position: { x: 300, y: 30 },
          size: { width: 200, height: 50 },
          style: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center' },
          properties: {},
        },
        {
          id: 'elem2',
          type: 'text',
          content: 'Wixi Yazılım A.Ş.',
          position: { x: 40, y: 40 },
          size: { width: 200, height: 30 },
          style: { fontFamily: 'Arial', fontSize: 14, color: '#333', textAlign: 'left' },
          properties: {},
        },
        {
          id: 'elem3',
          type: 'line',
          content: '',
          position: { x: 40, y: 100 },
          size: { width: 714, height: 2 },
          style: { backgroundColor: '#1a1a2e' },
          properties: {},
        },
        {
          id: 'elem4',
          type: 'variable',
          content: '{{musteri_adi}}',
          position: { x: 40, y: 130 },
          size: { width: 200, height: 30 },
          style: { fontFamily: 'Arial', fontSize: 12, color: '#0066cc', backgroundColor: '#f0f8ff', borderColor: '#0066cc', borderWidth: 1, borderRadius: 3 },
          properties: {},
        },
      ],
      paperSize: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    }),
    aciklama: 'Varsayılan fatura şablonu',
    olusturma_tarihi: '2025-01-10T10:00:00',
    guncelleme_tarihi: '2025-05-01T14:30:00',
  },
  {
    id: 2,
    ad: 'İrsaliye Şablonu',
    tip: 'irsaliye',
    varsayilan: false,
    icerik: JSON.stringify({
      elements: [
        {
          id: 'elem1',
          type: 'text',
          content: 'İRSALİYE',
          position: { x: 280, y: 30 },
          size: { width: 240, height: 50 },
          style: { fontFamily: 'Arial', fontSize: 22, fontWeight: 'bold', color: '#2d6a4f', textAlign: 'center' },
          properties: {},
        },
      ],
      paperSize: 'A4',
      orientation: 'landscape',
      margins: { top: 15, right: 15, bottom: 15, left: 15 },
    }),
    aciklama: 'Standart irsaliye şablonu',
    olusturma_tarihi: '2025-02-15T09:00:00',
  },
];

const dummyPrinters: Yazici[] = [
  { id: 1, ad: 'HP LaserJet Pro M404n', model: 'M404n', aktif: true },
  { id: 2, ad: 'Epson EcoTank L3150', model: 'L3150', aktif: true },
  { id: 3, ad: 'Canon PIXMA G3420', model: 'G3420', aktif: false },
];

let nextId = 3;

export const ciktiSablonuApi = {
  getAll: async (): Promise<ApiResponse<CiktiSablonu[]>> => ({
    success: true,
    data: [...dummyTemplates],
  }),

  getById: async (id: number): Promise<ApiResponse<CiktiSablonu>> => {
    const found = dummyTemplates.find(t => t.id === id);
    return found
      ? { success: true, data: { ...found } }
      : { success: false, message: 'Şablon bulunamadı' };
  },

  create: async (template: Omit<CiktiSablonu, 'id'>): Promise<ApiResponse<CiktiSablonu>> => {
    const newTemplate: CiktiSablonu = {
      ...template,
      id: ++nextId,
      olusturma_tarihi: new Date().toISOString(),
    };
    dummyTemplates.push(newTemplate);
    return { success: true, data: newTemplate };
  },

  update: async (template: CiktiSablonu): Promise<ApiResponse<CiktiSablonu>> => {
    const index = dummyTemplates.findIndex(t => t.id === template.id);
    if (index === -1) return { success: false, message: 'Şablon bulunamadı' };
    const updated = { ...template, guncelleme_tarihi: new Date().toISOString() };
    dummyTemplates[index] = updated;
    return { success: true, data: updated };
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const index = dummyTemplates.findIndex(t => t.id === id);
    if (index === -1) return { success: false, message: 'Şablon bulunamadı' };
    dummyTemplates.splice(index, 1);
    return { success: true };
  },
};

export const yaziciApi = {
  getAll: async (): Promise<ApiResponse<Yazici[]>> => ({
    success: true,
    data: [...dummyPrinters],
  }),
};
