import type { IconType } from 'react-icons';
import type { ThemeConfig } from '../../../../entities/StorePage/model/types';

export type PropFieldType = 'text' | 'textarea' | 'richtext' | 'number' | 'url' | 'color' | 'select' | 'image' | 'boolean' | 'json-array';

export interface RowFieldSchema {
  key: string;
  label: string;
  type: 'text' | 'url' | 'number' | 'textarea';
  placeholder?: string;
}

export interface PropField {
  field: string;
  type: PropFieldType;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  itemSchema?: RowFieldSchema[]; // for json-array: defines per-row fields
  group?: 'content' | 'visual' | 'style' | 'advanced';
}

export interface ChildElement {
  key: string;       // prop field name — e.g. "title", "subtitle", "buttonText"
  label: string;     // label shown in LayersPanel — e.g. "Başlık", "Alt Başlık"
  selector?: string; // optional CSS selector hint — e.g. "h1", "p", "button"
}

export interface BlockDefinition {
  type: string;
  name: string;
  category: 'hero' | 'content' | 'commerce' | 'marketing' | 'forms' | 'advanced' | 'corporate';
  icon: IconType;
  defaultProps: Record<string, unknown>;
  propsSchema: PropField[];
  children?: ChildElement[];
  toCss?: (props: Record<string, unknown>, theme: ThemeConfig) => string;
}
