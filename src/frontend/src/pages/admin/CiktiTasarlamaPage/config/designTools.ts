import type { DesignTool } from '../types';

export const designTools: DesignTool[] = [
  {
    type: 'text',
    name: 'Metin',
    icon: 'text',
    category: 'basic',
    defaultSize: { width: 100, height: 30 },
    defaultStyle: { fontFamily: 'Arial', fontSize: 12, color: '#000000', textAlign: 'left' },
  },
  {
    type: 'table',
    name: 'Tablo',
    icon: 'table',
    category: 'basic',
    defaultSize: { width: 400, height: 200 },
    defaultStyle: { fontFamily: 'Arial', fontSize: 10, borderColor: '#000000', borderWidth: 1, backgroundColor: '#ffffff' },
  },
  {
    type: 'line',
    name: 'Çizgi',
    icon: 'line',
    category: 'shapes',
    defaultSize: { width: 200, height: 2 },
    defaultStyle: { backgroundColor: '#000000', borderWidth: 1 },
  },
  {
    type: 'logo',
    name: 'Logo',
    icon: 'image',
    category: 'basic',
    defaultSize: { width: 120, height: 80 },
    defaultStyle: { backgroundColor: '#f5f5f5', borderColor: '#cccccc', borderWidth: 1, borderRadius: 4 },
  },
  {
    type: 'image',
    name: 'Resim',
    icon: 'image',
    category: 'basic',
    defaultSize: { width: 150, height: 100 },
    defaultStyle: { borderColor: '#cccccc', borderWidth: 1, borderRadius: 4 },
  },
  {
    type: 'barcode',
    name: 'Barkod',
    icon: 'barcode',
    category: 'advanced',
    defaultSize: { width: 200, height: 80 },
    defaultStyle: { fontFamily: 'monospace', fontSize: 10, backgroundColor: '#ffffff', borderColor: '#000000', borderWidth: 1 },
  },
  {
    type: 'variable',
    name: 'Değişken',
    icon: 'variable',
    category: 'data',
    defaultSize: { width: 120, height: 30 },
    defaultStyle: { fontFamily: 'Arial', fontSize: 12, color: '#0066cc', backgroundColor: '#f0f8ff', borderColor: '#0066cc', borderWidth: 1, borderRadius: 3 },
  },
  {
    type: 'shape',
    name: 'Şekil',
    icon: 'shape',
    category: 'shapes',
    defaultSize: { width: 100, height: 100 },
    defaultStyle: { backgroundColor: '#e0e0e0', borderColor: '#999999', borderWidth: 1 },
  },
  {
    type: 'chart',
    name: 'Grafik',
    icon: 'chart',
    category: 'advanced',
    defaultSize: { width: 300, height: 200 },
    defaultStyle: { backgroundColor: '#ffffff', borderColor: '#cccccc', borderWidth: 1, borderRadius: 4 },
  },
  {
    type: 'checkbox',
    name: 'Onay Kutusu',
    icon: 'checkbox',
    category: 'basic',
    defaultSize: { width: 120, height: 24 },
    defaultStyle: { fontFamily: 'Arial', fontSize: 12, color: '#000000' },
  },
  {
    type: 'richText',
    name: 'Zengin Metin',
    icon: 'richtext',
    category: 'basic',
    defaultSize: { width: 200, height: 60 },
    defaultStyle: { fontFamily: 'Arial', fontSize: 12, color: '#000000', backgroundColor: '#ffffff', borderColor: '#cccccc', borderWidth: 1 },
  },
  {
    type: 'pageInfo',
    name: 'Sayfa Bilgisi',
    icon: 'pageinfo',
    category: 'data',
    defaultSize: { width: 120, height: 24 },
    defaultStyle: { fontFamily: 'Arial', fontSize: 10, color: '#666666', textAlign: 'center' },
  },
  {
    type: 'panel',
    name: 'Panel',
    icon: 'panel',
    category: 'shapes',
    defaultSize: { width: 200, height: 100 },
    defaultStyle: { backgroundColor: '#f8f8f8', borderColor: '#cccccc', borderWidth: 1, borderRadius: 4 },
  },
];

const defaultContents: Partial<Record<string, string>> = {
  text: 'Yeni Metin',
  variable: '{{değişken}}',
  checkbox: 'Onay Kutusu',
  pageInfo: '{Sayfa} / {ToplamSayfa}',
  richText: 'Zengin metin içeriği',
  panel: '',
};

export const getDefaultContent = (type: string): string =>
  defaultContents[type] ?? '';

export const getDesignTool = (type: string): DesignTool | undefined =>
  designTools.find(tool => tool.type === type);

export const getDesignToolsByCategory = (category: string): DesignTool[] =>
  designTools.filter(tool => tool.category === category);
