import { useEditor, findComponentInRows } from '../../ThemeBuilder/context/EditorContext';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Button } from '../../../shared/ui/Button/Button';
import { FaTrash, FaCopy } from 'react-icons/fa';
import styles from '../../ThemeBuilder/panels/Panels.module.css';

export function DesignPanel() {
  const { state, dispatch } = useEditor();
  const { layout, selectedComponentId, selectedRowId } = state;

  // Skip global-navbar and global-footer (no layout design props)
  const isGlobalSection = selectedComponentId === 'global-navbar' || selectedComponentId === 'global-footer';

  // Find active element
  const activeComp = selectedComponentId && !isGlobalSection ? findComponentInRows(layout, selectedComponentId) : null;
  const activeRow = !activeComp && selectedRowId ? layout.find(r => r.id === selectedRowId) : null;

  const activeElement = activeComp || activeRow;

  if (isGlobalSection) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--editor-text-muted)', fontSize: '12px' }}>
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>{selectedComponentId === 'global-navbar' ? '🧭' : '🦶'}</div>
        <div style={{ fontWeight: 600, color: 'var(--editor-text)', marginBottom: '8px' }}>
          {selectedComponentId === 'global-navbar' ? 'Navbar' : 'Footer'} Seçili
        </div>
        <div>Tasarım özellikleri için <strong>İçerik</strong> sekmesini kullanın.</div>
      </div>
    );
  }

  if (!activeElement) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--editor-text-muted)', fontSize: '13px' }}>
        Tasarım özelliklerini düzenlemek için Canvas üzerinde bir satır veya bileşen seçin.
      </div>
    );
  }

  const p = (activeElement.props as any) || {};

  const updateProp = (key: string, value: unknown) => {
    if (activeComp) {
      dispatch({
        type: 'UPDATE_COMPONENT_PROPS',
        componentId: activeComp.id,
        props: { ...p, [key]: value }
      });
    } else if (activeRow) {
      dispatch({
        type: 'UPDATE_ROW_PROPS',
        rowId: activeRow.id,
        props: { ...p, [key]: value }
      });
    }
  };

  const handleDuplicate = () => {
    if (activeComp) {
      // In Web Builder, duplicate row or component
      // We can trigger an alert or simply use context dispatch if supported
    }
  };

  const handleDelete = () => {
    if (activeComp) {
      dispatch({ type: 'REMOVE_COMPONENT', componentId: activeComp.id });
    } else if (activeRow) {
      dispatch({ type: 'REMOVE_ROW', rowId: activeRow.id });
    }
  };

  // Helper values
  const paddingTop = String(p.paddingTop ?? p.paddingY ?? '');
  const paddingRight = String(p.paddingRight ?? p.paddingX ?? '');
  const paddingBottom = String(p.paddingBottom ?? p.paddingY ?? '');
  const paddingLeft = String(p.paddingLeft ?? p.paddingX ?? '');

  const marginTop = String(p.marginTop ?? '');
  const marginRight = String(p.marginRight ?? '');
  const marginBottom = String(p.marginBottom ?? '');
  const marginLeft = String(p.marginLeft ?? '');

  const borderStyle = String(p.borderStyle ?? 'none');
  const borderWidth = String(p.borderWidth ?? '');
  const borderColor = String(p.borderColor ?? '');
  const borderRadius = String(p.borderRadius ?? '');

  const shadowPreset = String(p.boxShadow ?? 'none');

  return (
    <div className={styles.panel} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Active Element Info Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--editor-border)' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--editor-text)' }}>
            {activeComp ? 'Bileşen' : 'Satır'} Düzenle
          </div>
          <div style={{ fontSize: '10px', color: 'var(--editor-text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            #{activeElement.id.slice(0, 8)}... ({activeComp?.type || 'row'})
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button variant="danger" onClick={handleDelete} style={{ padding: '8px', minWidth: 'auto', height: '32px' }} title="Sil">
            <FaTrash size={11} />
          </Button>
        </div>
      </div>

      {/* Spacing (Padding & Margin) */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--editor-text-muted)', marginBottom: '10px' }}>
          Hizalama & Boşluklar (Spacing)
        </div>

        {/* Visual Box Model Editor */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--editor-border)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Padding Controls */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--editor-text-muted)', marginBottom: '6px' }}>İç Boşluk (Padding)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <Input
                label="Üst (Top)"
                value={paddingTop}
                onChange={e => updateProp('paddingTop', e.target.value)}
                placeholder="Örn: 20px"
              />
              <Input
                label="Sağ (Right)"
                value={paddingRight}
                onChange={e => updateProp('paddingRight', e.target.value)}
                placeholder="Örn: 20px"
              />
              <Input
                label="Alt (Bottom)"
                value={paddingBottom}
                onChange={e => updateProp('paddingBottom', e.target.value)}
                placeholder="Örn: 20px"
              />
              <Input
                label="Sol (Left)"
                value={paddingLeft}
                onChange={e => updateProp('paddingLeft', e.target.value)}
                placeholder="Örn: 20px"
              />
            </div>
          </div>

          {/* Margin Controls */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--editor-text-muted)', marginBottom: '6px' }}>Dış Boşluk (Margin)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <Input
                label="Üst (Top)"
                value={marginTop}
                onChange={e => updateProp('marginTop', e.target.value)}
                placeholder="Örn: 10px"
              />
              <Input
                label="Sağ (Right)"
                value={marginRight}
                onChange={e => updateProp('marginRight', e.target.value)}
                placeholder="Örn: 10px"
              />
              <Input
                label="Alt (Bottom)"
                value={marginBottom}
                onChange={e => updateProp('marginBottom', e.target.value)}
                placeholder="Örn: 10px"
              />
              <Input
                label="Sol (Left)"
                value={marginLeft}
                onChange={e => updateProp('marginLeft', e.target.value)}
                placeholder="Örn: 10px"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Colors (Appearance) */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--editor-text-muted)', marginBottom: '10px' }}>
          Görünüm (Appearance)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Background Color */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--editor-text-muted)' }}>Arka Plan Rengi</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="color"
                value={p.backgroundColor && String(p.backgroundColor).startsWith('#') ? String(p.backgroundColor) : '#ffffff'}
                onChange={e => updateProp('backgroundColor', e.target.value)}
                style={{ width: '28px', height: '28px', border: '1px solid var(--editor-border)', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              />
              <Input
                value={String(p.backgroundColor ?? '')}
                onChange={e => updateProp('backgroundColor', e.target.value)}
                placeholder="Şeffaf"
                style={{ width: '90px' }}
              />
            </div>
          </div>

          {/* Text Color */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--editor-text-muted)' }}>Yazı Rengi</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="color"
                value={p.textColor && String(p.textColor).startsWith('#') ? String(p.textColor) : '#000000'}
                onChange={e => updateProp('textColor', e.target.value)}
                style={{ width: '28px', height: '28px', border: '1px solid var(--editor-border)', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              />
              <Input
                value={String(p.textColor ?? '')}
                onChange={e => updateProp('textColor', e.target.value)}
                placeholder="Varsayılan"
                style={{ width: '90px' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Borders */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--editor-text-muted)', marginBottom: '10px' }}>
          Kenarlıklar (Borders)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Select
            label="Kenarlık Stili"
            value={borderStyle}
            onChange={v => updateProp('borderStyle', v)}
            options={[
              { label: 'Yok', value: 'none' },
              { label: 'Düz (Solid)', value: 'solid' },
              { label: 'Kesikli (Dashed)', value: 'dashed' },
              { label: 'Noktalı (Dotted)', value: 'dotted' },
            ]}
          />
          {borderStyle !== 'none' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                label="Genişlik"
                value={borderWidth}
                onChange={e => updateProp('borderWidth', e.target.value)}
                placeholder="Örn: 1px"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--editor-text-muted)' }}>Renk</span>
                <input
                  type="color"
                  value={borderColor.startsWith('#') ? borderColor : '#cccccc'}
                  onChange={e => updateProp('borderColor', e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--editor-border)', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                />
              </div>
            </div>
          )}
          <Input
            label="Köşe Yuvarlaklığı (Radius)"
            value={borderRadius}
            onChange={e => updateProp('borderRadius', e.target.value)}
            placeholder="Örn: 8px veya 50%"
          />
        </div>
      </div>

      {/* Shadows (Effects) */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--editor-text-muted)', marginBottom: '10px' }}>
          Efektler (Effects)
        </div>
        <Select
          label="Gölge (Box Shadow)"
          value={shadowPreset}
          onChange={v => updateProp('boxShadow', v)}
          options={[
            { label: 'Yok', value: 'none' },
            { label: 'Hafif (Card)', value: '0 4px 12px rgba(0,0,0,0.05)' },
            { label: 'Orta', value: '0 8px 24px rgba(0,0,0,0.1)' },
            { label: 'Yoğun (Floating)', value: '0 16px 40px rgba(0,0,0,0.15)' },
          ]}
        />
      </div>

    </div>
  );
}
