import React, { useState } from 'react';
import type { DataField } from '../types';
import { mockDataSchema } from '../config/dataSchema';
import s from './fieldListPanel.module.css';

const TYPE_ICONS: Record<DataField['type'], string> = {
  string: 'T',
  number: '#',
  date: '📅',
  currency: '₺',
  boolean: '✓',
};

const FieldListPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [collapsedEntities, setCollapsedEntities] = useState<Set<string>>(new Set());

  const toggleEntity = (entity: string) => {
    const next = new Set(collapsedEntities);
    if (next.has(entity)) next.delete(entity);
    else next.add(entity);
    setCollapsedEntities(next);
  };

  const handleDragStart = (e: React.DragEvent, field: DataField) => {
    e.dataTransfer.setData('fieldData', JSON.stringify(field));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filtered = mockDataSchema
    .map(schema => ({
      ...schema,
      fields: schema.fields.filter(
        f => !search || f.label.toLowerCase().includes(search.toLowerCase()) || f.field.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter(schema => schema.fields.length > 0);

  return (
    <div className={s.container}>
      <input
        type="text"
        className={s.searchBox}
        placeholder="Alan ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <div className={s.emptyMsg}>Alan bulunamadı</div>
      )}

      {filtered.map(schema => {
        const isCollapsed = collapsedEntities.has(schema.entity);
        return (
          <div key={schema.entity} className={s.entityGroup}>
            <button
              className={s.entityHeader}
              onClick={() => toggleEntity(schema.entity)}
            >
              <span className={s.entityLabel}>
                <span>{schema.icon}</span>
                <span>{schema.label}</span>
              </span>
              <svg
                className={s.chevron}
                style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!isCollapsed && (
              <div className={s.fieldList}>
                {schema.fields.map(field => (
                  <div
                    key={`${field.entity}-${field.field}`}
                    className={s.fieldRow}
                    draggable
                    onDragStart={(e) => handleDragStart(e, field)}
                    title={`${field.entity}.${field.field} (${field.type})`}
                  >
                    <em className={s.typeIcon}>{TYPE_ICONS[field.type]}</em>
                    <span className={s.fieldLabel}>{field.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FieldListPanel;
