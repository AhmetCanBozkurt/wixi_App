export interface ReportElement {
  id: string;
  type: 'text' | 'table' | 'line' | 'logo' | 'barcode' | 'variable' | 'image' | 'shape' | 'chart';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: ReportElementStyle;
  properties: Record<string, unknown>;
  dataBinding?: string;
  expression?: string;
}

export interface ReportElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  imageUrl?: string;
}

export interface ReportPage {
  id: string;
  name: string;
  size: 'A4' | 'A5' | 'Letter' | 'Legal' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  elements: ReportElement[];
  background?: string;
  header?: ReportElement[];
  footer?: ReportElement[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  pages: ReportPage[];
  dataSource?: string;
  parameters?: ReportParameter[];
  variables?: ReportVariable[];
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  defaultValue?: unknown;
  description?: string;
}

export interface ReportVariable {
  name: string;
  expression: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface DesignTool {
  type: ReportElement['type'];
  name: string;
  icon: string;
  category: 'basic' | 'advanced' | 'data' | 'shapes';
  defaultSize: { width: number; height: number };
  defaultStyle: Partial<ReportElementStyle>;
}

export interface PropertyPanel {
  id: string;
  name: string;
  icon: string;
  category: 'appearance' | 'layout' | 'data' | 'behavior';
}
