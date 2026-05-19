import React, { useState } from 'react';
import { designTools, getDesignToolsByCategory } from '../config/designTools';
import { getIconComponent } from './icons';
import type { ReportElement } from '../types';

interface ToolboxProps {
  onElementAdd: (element: ReportElement) => void;
  onDragStart?: (type: ReportElement['type']) => void;
  onDragEnd?: () => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ onElementAdd, onDragStart, onDragEnd }) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

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
      content: tool.type === 'text' ? 'Yeni Metin' : tool.type === 'variable' ? '{{değişken}}' : '',
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
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4">
      {categories.map(category => {
        const tools = getDesignToolsByCategory(category.id);
        const IconComponent = getIconComponent(category.icon);
        const isCollapsed = collapsedSections.has(category.id);

        return (
          <div key={category.id} className="space-y-2">
            <button
              onClick={() => toggleSection(category.id)}
              className="w-full flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
              </div>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!isCollapsed && (
              <div className="space-y-1 pl-2">
                {tools.map(tool => {
                  const ToolIcon = getIconComponent(tool.icon);
                  return (
                    <div
                      key={tool.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tool)}
                      onDragEnd={onDragEnd}
                      onClick={() => handleToolClick(tool)}
                      className="group flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                      title={`${tool.name} Ekle`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                        <ToolIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{tool.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {tool.defaultSize.width}×{tool.defaultSize.height}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Toolbox;
