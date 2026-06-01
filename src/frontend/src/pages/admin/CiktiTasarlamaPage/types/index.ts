export type ReportElementType =
  | 'text' | 'table' | 'line' | 'logo' | 'barcode' | 'variable'
  | 'image' | 'shape' | 'chart'
  | 'checkbox' | 'panel' | 'pageInfo' | 'richText';

export type BandType =
  | 'reportHeader' | 'pageHeader' | 'groupHeader'
  | 'detail'
  | 'groupFooter' | 'pageFooter' | 'reportFooter';

export type DesignMode = 'freeform' | 'banded';

export interface ReportBand {
  id: string;
  type: BandType;
  label: string;
  height: number;   // px
  visible: boolean;
  color: string;    // band header accent color
}

export interface DataField {
  entity: string;
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
}

export interface DataSchema {
  entity: string;
  label: string;
  icon: string;
  fields: DataField[];
}

export interface ReportElement {
  id: string;
  type: ReportElementType;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: ReportElementStyle;
  properties: Record<string, unknown>;
  dataBinding?: string;
  expression?: string;
  bandId?: string;
}

export interface ReportElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: 'none' | 'underline' | 'line-through';
  lineHeight?: number;
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
  checked?: boolean;
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
  type: ReportElementType;
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
