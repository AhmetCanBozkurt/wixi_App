import React, { useState } from 'react';
import { designTools, getDesignToolsByCategory, getDefaultContent } from '../config/designTools';
import { getIconComponent } from './icons';
import FieldListPanel from './FieldListPanel';
import type { ReportElement } from '../types';

interface ToolboxProps {
  onElementAdd: (element: ReportElement) => void;
  onDragStart?: (type: ReportElement['type']) => void;
  onDragEnd?: () => void;
}

type ActiveTab = 'tools' | 'fields';

const Toolbox: React.FC<ToolboxProps> = ({ onElementAdd, onDragStart, onDragEnd }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tools');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const categories = [
    { id: 'basic', name: 'Temel', icon: 'text' },
    { id: 'shapes', name: 'Şekiller', icon: 'shape' },
    { id: 'data', name: 'Veri', icon: 'variable' },
    { id: 'advanced', name: 'Gelişmiş', icon: 'chart' },
  ];

  const handleToolClick = (tool: (typeof designTools)[0]) => {
    const newElement: ReportElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: tool.type,
      content: getDefaultContent(tool.type),
      position: { x: 50, y: 50 },
      size: tool.defaultSize,
      style: tool.defaultStyle,
      properties: {},
    };
    onElementAdd(newElement);
  };

  const handleDragStart = (e: React.DragEvent, tool: (typeof designTools)[0]) => {
    e.dataTransfer.setData('elementType', tool.type);
    e.dataTransfer.setData('elementData', JSON.stringify({ defaultSize: tool.defaultSize, defaultStyle: tool.defaultStyle }));
    onDragStart?.(tool.type);
  };

  const toggleSection = (categoryId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(categoryId)) newCollapsed.delete(categoryId);
    else newCollapsed.add(categoryId);
    setCollapsedSections(newCollapsed);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-glass)',
          flexShrink: 0,
        }}
      >
        {([
          { id: 'tools', label: 'Araçlar' },
          { id: 'fields', label: 'Veri Alanları' },
        ] as Array<{ id: ActiveTab; label: string }>).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '6px 4px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              borderBottom: activeTab === tab.id
                ? '2px solid var(--color-primary)'
                : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-muted)',
              transition: 'color 0.12s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'tools' && (
          <div className="p-3 flex flex-col gap-3">
            {categories.map(category => {
              const tools = getDesignToolsByCategory(category.id);
              const IconComponent = getIconComponent(category.icon);
              const isCollapsed = collapsedSections.has(category.id);

              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleSection(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      borderLeft: isCollapsed ? '3px solid transparent' : '3px solid var(--color-primary)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold tracking-wide uppercase">{category.name}</span>
                    </div>
                    <svg
                      className="w-3.5 h-3.5 transition-transform"
                      style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', color: 'var(--text-muted)' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {!isCollapsed && (
                    <div className="mt-1 space-y-0.5 pl-1">
                      {tools.map(tool => {
                        const ToolIcon = getIconComponent(tool.icon);
                        const isHovered = hoveredTool === tool.type;
                        return (
                          <div
                            key={tool.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, tool)}
                            onDragEnd={onDragEnd}
                            onClick={() => handleToolClick(tool)}
                            onMouseEnter={() => setHoveredTool(tool.type)}
                            onMouseLeave={() => setHoveredTool(null)}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-150 cursor-pointer select-none"
                            style={{
                              background: isHovered ? 'var(--surface-hover)' : 'transparent',
                              color: isHovered ? 'var(--color-primary)' : 'var(--text-secondary)',
                            }}
                            title={`${tool.name} ekle (veya sürükle)`}
                          >
                            <div
                              className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 transition-colors"
                              style={{ background: isHovered ? 'var(--color-primary)' + '22' : 'var(--bg-secondary)' }}
                            >
                              <ToolIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-medium flex-1">{tool.name}</span>
                            <svg
                              className="w-3.5 h-3.5 transition-opacity"
                              style={{ opacity: isHovered ? 1 : 0, color: 'var(--color-primary)' }}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'fields' && <FieldListPanel />}
      </div>
    </div>
  );
};

export default Toolbox;
