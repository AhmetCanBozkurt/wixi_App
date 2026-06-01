import React from 'react';
import type { ReportElement, ReportElementStyle } from '../types';
import {
  BoldIcon, ItalicIcon, UnderlineIcon,
  AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon,
} from './icons';
import s from './formatToolbar.module.css';

interface FormatToolbarProps {
  selectedElement: ReportElement | null;
  onElementUpdate: (el: ReportElement) => void;
}

const TEXT_TYPES = new Set(['text', 'richText', 'variable']);

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];

const FormatToolbar: React.FC<FormatToolbarProps> = ({ selectedElement, onElementUpdate }) => {
  const isTextElement = selectedElement !== null && TEXT_TYPES.has(selectedElement.type);

  const updateStyle = (patch: Partial<ReportElementStyle>) => {
    if (!selectedElement) return;
    onElementUpdate({ ...selectedElement, style: { ...selectedElement.style, ...patch } });
  };

  if (!isTextElement) {
    return (
      <div className={s.toolbar}>
        <span className={s.placeholder}>Biçimlendirme — bir metin öğesi seçin</span>
      </div>
    );
  }

  const style = selectedElement.style;
  const isBold = style.fontWeight === '700' || style.fontWeight === 'bold';
  const isItalic = style.fontStyle === 'italic';
  const isUnderline = style.textDecoration === 'underline';
  const fontSize = style.fontSize ?? 12;
  const fontFamily = style.fontFamily ?? 'Arial';
  const textAlign = style.textAlign ?? 'left';

  const alignButtons: Array<{ value: ReportElementStyle['textAlign']; Icon: React.FC<{ className?: string; size?: number }> }> = [
    { value: 'left', Icon: AlignLeftIcon },
    { value: 'center', Icon: AlignCenterIcon },
    { value: 'right', Icon: AlignRightIcon },
    { value: 'justify', Icon: AlignJustifyIcon },
  ];

  return (
    <div className={s.toolbar}>
      <button
        className={`${s.btn} ${isBold ? s.btnActive : s.btnInactive}`}
        onClick={() => updateStyle({ fontWeight: isBold ? '400' : '700' })}
        title="Kalın"
      >
        <BoldIcon size={14} />
      </button>

      <button
        className={`${s.btn} ${isItalic ? s.btnActive : s.btnInactive}`}
        onClick={() => updateStyle({ fontStyle: isItalic ? 'normal' : 'italic' })}
        title="İtalik"
      >
        <ItalicIcon size={14} />
      </button>

      <button
        className={`${s.btn} ${isUnderline ? s.btnActive : s.btnInactive}`}
        onClick={() => updateStyle({ textDecoration: isUnderline ? 'none' : 'underline' })}
        title="Altı Çizili"
      >
        <UnderlineIcon size={14} />
      </button>

      <div className={s.divider} />

      <input
        type="number"
        className={s.fontSizeInput}
        value={fontSize}
        min={8}
        max={72}
        onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
        title="Yazı Boyutu"
      />

      <div className={s.divider} />

      {alignButtons.map(({ value, Icon }) => (
        <button
          key={value}
          className={`${s.btn} ${textAlign === value ? s.btnActive : s.btnInactive}`}
          onClick={() => updateStyle({ textAlign: value })}
          title={value}
        >
          <Icon size={14} />
        </button>
      ))}

      <div className={s.divider} />

      <select
        className={s.fontSelect}
        value={fontFamily}
        onChange={(e) => updateStyle({ fontFamily: e.target.value })}
        title="Yazı Tipi"
      >
        {FONTS.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </div>
  );
};

export default FormatToolbar;
