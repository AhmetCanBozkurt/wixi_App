import React, { useRef, useState, useEffect } from 'react';
import type { ReportElement, DesignMode } from '../types';
import { getIconComponent } from './icons';

interface DesignCanvasProps {
  elements: ReportElement[];
  selectedElement: ReportElement | null;
  onElementSelect: (element: ReportElement | null) => void;
  onElementUpdate: (element: ReportElement) => void;
  onElementAdd: (element: ReportElement) => void;
  paperSize: 'A4' | 'A5' | 'Letter' | 'Legal' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  showRulers: boolean;
  showAlignmentGuides: boolean;
  snapToGrid: boolean;
  gridSize: number;
  autoResize: boolean;
  zoom: number;
  designMode?: DesignMode;
}

const BANDS = [
  { label: 'Rapor Başlığı', height: 70, color: '#6366f1' },
  { label: 'Sayfa Başlığı', height: 50, color: '#0ea5e9' },
  { label: 'Detay',         height: 160, color: '#10b981' },
  { label: 'Sayfa Altbilgisi', height: 50, color: '#f59e0b' },
  { label: 'Rapor Altbilgisi', height: 70, color: '#ef4444' },
];

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  elements,
  selectedElement,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  paperSize,
  orientation,
  margins,
  showRulers,
  showAlignmentGuides,
  snapToGrid,
  gridSize,
  autoResize: _autoResize,
  zoom,
  designMode = 'freeform',
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStartData, setResizeStartData] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [alignmentGuides, setAlignmentGuides] = useState<{ vertical: number[]; horizontal: number[] }>({ vertical: [], horizontal: [] });

  const getPaperDimensions = () => {
    const dimensions = {
      A4: { width: 210, height: 297 },
      A5: { width: 148, height: 210 },
      Letter: { width: 216, height: 279 },
      Legal: { width: 216, height: 356 },
      Custom: { width: 210, height: 297 },
    };
    const size = dimensions[paperSize];
    return orientation === 'landscape' ? { width: size.height, height: size.width } : size;
  };

  const paperDimensions = getPaperDimensions();
  const scale = 2.83;

  const [canvasDimensions, setCanvasDimensions] = useState(() => ({
    width: paperDimensions.width * scale,
    height: paperDimensions.height * scale,
  }));

  useEffect(() => {
    const newDimensions = getPaperDimensions();
    setCanvasDimensions({ width: newDimensions.width * scale, height: newDimensions.height * scale });
  }, [paperSize, orientation]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const rulerOffset = showRulers ? 30 : 0;
        const x = e.clientX - rect.left + rulerOffset;
        const y = e.clientY - rect.top + rulerOffset;
        if (x >= 0 && x <= canvasDimensions.width && y >= 0 && y <= canvasDimensions.height) {
          setMousePosition({ x, y });
        }
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [canvasDimensions.width, canvasDimensions.height, showRulers]);

  const renderHorizontalRuler = () => {
    const rulerWidth = canvasDimensions.width;
    const step = 20;
    return (
      <div className="bg-gray-100 border-b border-gray-300 flex items-end relative" style={{ height: '30px', width: `${rulerWidth}px` }}>
        {Array.from({ length: Math.floor(rulerWidth / step) + 1 }, (_, i) => {
          const x = i * step;
          const value = Math.round((x - 30) / scale);
          return (
            <div key={i} className="relative">
              <div className="absolute bg-gray-400" style={{ left: `${x}px`, width: '1px', height: i % 5 === 0 ? '20px' : '10px', bottom: '0' }} />
              {i % 5 === 0 && value >= 0 && (
                <div className="absolute text-xs text-gray-600" style={{ left: `${x + 2}px`, bottom: '22px', fontSize: '10px' }}>
                  {value}mm
                </div>
              )}
            </div>
          );
        })}
        {mousePosition.x > 0 && mousePosition.x < rulerWidth && (
          <div className="absolute bg-blue-500 w-0.5 h-full" style={{ left: `${mousePosition.x}px`, zIndex: 10 }} />
        )}
      </div>
    );
  };

  const renderVerticalRuler = () => {
    const rulerHeight = canvasDimensions.height;
    const step = 20;
    return (
      <div className="bg-gray-100 border-r border-gray-300 flex flex-col items-end relative" style={{ width: '30px', height: `${rulerHeight}px` }}>
        {Array.from({ length: Math.floor(rulerHeight / step) + 1 }, (_, i) => {
          const y = i * step;
          const value = Math.round((y - 30) / scale);
          return (
            <div key={i} className="relative">
              <div className="absolute bg-gray-400" style={{ top: `${y}px`, height: '1px', width: i % 5 === 0 ? '20px' : '10px', right: '0' }} />
              {i % 5 === 0 && value >= 0 && (
                <div className="absolute text-xs text-gray-600 transform -rotate-90 origin-left" style={{ top: `${y + 2}px`, right: '22px', fontSize: '10px' }}>
                  {value}mm
                </div>
              )}
            </div>
          );
        })}
        {mousePosition.y > 0 && mousePosition.y < rulerHeight && (
          <div className="absolute bg-blue-500 h-0.5 w-full" style={{ top: `${mousePosition.y}px`, zIndex: 10 }} />
        )}
      </div>
    );
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) onElementSelect(null);
  };

  const handleElementClick = (e: React.MouseEvent, element: ReportElement) => {
    e.stopPropagation();
    onElementSelect(element);
  };

  const handleElementDragStart = (e: React.MouseEvent, element: ReportElement) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - (element.position.x + rect.left), y: e.clientY - (element.position.y + rect.top) });
    setIsDragging(true);
    onElementSelect(element);
  };

  const calculateAlignmentGuides = (x: number, y: number, size: { width: number; height: number }) => {
    const guides = { vertical: [] as number[], horizontal: [] as number[] };
    const tolerance = 5;
    elements.filter(el => el.id !== selectedElement?.id).forEach(element => {
      const { x: elX, y: elY } = element.position;
      const { width: elW, height: elH } = element.size;
      if (Math.abs(x - elX) <= tolerance) guides.vertical.push(elX);
      if (Math.abs((x + size.width / 2) - (elX + elW / 2)) <= tolerance) guides.vertical.push(elX + elW / 2);
      if (Math.abs((x + size.width) - (elX + elW)) <= tolerance) guides.vertical.push(elX + elW);
      if (Math.abs(y - elY) <= tolerance) guides.horizontal.push(elY);
      if (Math.abs((y + size.height / 2) - (elY + elH / 2)) <= tolerance) guides.horizontal.push(elY + elH / 2);
      if (Math.abs((y + size.height) - (elY + elH)) <= tolerance) guides.horizontal.push(elY + elH);
    });
    return guides;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      let newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
      let newY = Math.max(0, e.clientY - rect.top - dragOffset.y);
      if (snapToGrid) { newX = Math.round(newX / gridSize) * gridSize; newY = Math.round(newY / gridSize) * gridSize; }
      setAlignmentGuides(calculateAlignmentGuides(newX, newY, selectedElement.size));
      onElementUpdate({ ...selectedElement, position: { x: newX, y: newY } });
    } else if (isResizing && selectedElement && canvasRef.current && resizeHandle) {
      const rect = canvasRef.current.getBoundingClientRect();
      let mouseX = e.clientX - rect.left;
      let mouseY = e.clientY - rect.top;
      if (snapToGrid) { mouseX = Math.round(mouseX / gridSize) * gridSize; mouseY = Math.round(mouseY / gridSize) * gridSize; }
      let { width: newW, height: newH, x: newX, y: newY } = resizeStartData;
      const min = 20;
      switch (resizeHandle) {
        case 'nw': newW = Math.max(min, resizeStartData.width + (resizeStartData.x - mouseX)); newH = Math.max(min, resizeStartData.height + (resizeStartData.y - mouseY)); newX = mouseX; newY = mouseY; break;
        case 'n': newH = Math.max(min, resizeStartData.height + (resizeStartData.y - mouseY)); newY = mouseY; break;
        case 'ne': newW = Math.max(min, mouseX - resizeStartData.x); newH = Math.max(min, resizeStartData.height + (resizeStartData.y - mouseY)); newY = mouseY; break;
        case 'w': newW = Math.max(min, resizeStartData.width + (resizeStartData.x - mouseX)); newX = mouseX; break;
        case 'e': newW = Math.max(min, mouseX - resizeStartData.x); break;
        case 'sw': newW = Math.max(min, resizeStartData.width + (resizeStartData.x - mouseX)); newH = Math.max(min, mouseY - resizeStartData.y); newX = mouseX; break;
        case 's': newH = Math.max(min, mouseY - resizeStartData.y); break;
        case 'se': newW = Math.max(min, mouseX - resizeStartData.x); newH = Math.max(min, mouseY - resizeStartData.y); break;
      }
      onElementUpdate({ ...selectedElement, position: { x: newX, y: newY }, size: { width: newW, height: newH } });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setAlignmentGuides({ vertical: [], horizontal: [] });
  };

  const handleResizeStart = (e: React.MouseEvent, element: ReportElement, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStartData({ width: element.size.width, height: element.size.height, x: element.position.x, y: element.position.y });
    onElementSelect(element);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = Math.max(0, e.clientX - rect.left);
    const dropY = Math.max(0, e.clientY - rect.top);

    // Field list drag — creates a bound text element
    const fieldDataRaw = e.dataTransfer.getData('fieldData');
    if (fieldDataRaw) {
      try {
        const field = JSON.parse(fieldDataRaw) as { entity: string; field: string; label: string };
        const binding = `${field.entity}.${field.field}`;
        const newElement: ReportElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'variable',
          content: `{${binding}}`,
          position: { x: dropX, y: dropY },
          size: { width: 140, height: 28 },
          style: { fontFamily: 'Arial', fontSize: 11, color: '#0066cc', backgroundColor: '#f0f8ff', borderColor: '#0066cc', borderWidth: 1, borderRadius: 3 },
          properties: {},
          dataBinding: binding,
        };
        onElementAdd(newElement);
        onElementSelect(newElement);
        return;
      } catch { /* fall through */ }
    }

    const elementType = e.dataTransfer.getData('elementType') as ReportElement['type'];
    if (!elementType) return;
    let defaultData: { defaultSize: { width: number; height: number }; defaultStyle: Record<string, unknown> };
    try { defaultData = JSON.parse(e.dataTransfer.getData('elementData')); }
    catch { defaultData = { defaultSize: { width: 100, height: 30 }, defaultStyle: {} }; }

    const contentMap: Partial<Record<ReportElement['type'], string>> = {
      text: 'Yeni Metin', variable: '{{değişken}}', barcode: '123456789',
      checkbox: 'Onay Kutusu', richText: 'Zengin metin içeriği',
      pageInfo: '{Sayfa} / {ToplamSayfa}', panel: '',
    };

    const newElement: ReportElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: elementType,
      content: contentMap[elementType] ?? '',
      position: { x: dropX, y: dropY },
      size: defaultData.defaultSize,
      style: defaultData.defaultStyle,
      properties: {},
    };
    onElementAdd(newElement);
    onElementSelect(newElement);
  };

  const renderElement = (element: ReportElement) => {
    const isSelected = selectedElement?.id === element.id;
    const IconComponent = getIconComponent(element.type);
    const elementStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      cursor: isDragging || isResizing ? 'grabbing' : 'grab',
      backgroundColor: element.style.backgroundColor || 'transparent',
      color: element.style.color || '#000000',
      fontFamily: element.style.fontFamily || 'Arial',
      fontSize: `${element.style.fontSize || 12}px`,
      fontWeight: element.style.fontWeight || 'normal',
      textAlign: element.style.textAlign || 'left',
      opacity: element.style.opacity || 1,
      zIndex: isSelected ? 1000 : 1,
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px',
      borderRadius: `${element.style.borderRadius || 0}px`,
      borderColor: isSelected ? '#3b82f6' : (element.style.borderColor || '#d1d5db'),
      borderWidth: isSelected ? '2px' : `${element.style.borderWidth || 1}px`,
      borderStyle: isSelected ? 'solid' : 'dashed',
    };

    const renderContent = () => {
      switch (element.type) {
        case 'text':
          return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '2px 4px', fontStyle: element.style.fontStyle, fontWeight: element.style.fontWeight, textDecoration: element.style.textDecoration, textAlign: element.style.textAlign || 'left' }}>{element.content}</div>;
        case 'variable':
          return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '2px 6px', fontFamily: 'monospace', fontSize: '11px' }}>{element.content}</div>;
        case 'richText':
          return <div style={{ width: '100%', height: '100%', padding: '4px 6px', fontSize: `${element.style.fontSize || 12}px`, overflowY: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{element.content}</div>;
        case 'checkbox': {
          const checked = element.properties.checked as boolean | undefined;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 4px', width: '100%', height: '100%' }}>
              <div style={{ width: '14px', height: '14px', border: '1.5px solid #555', borderRadius: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize: `${element.style.fontSize || 12}px`, color: element.style.color || '#000' }}>{element.content}</span>
            </div>
          );
        }
        case 'pageInfo':
          return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: element.style.textAlign === 'center' ? 'center' : element.style.textAlign === 'right' ? 'flex-end' : 'flex-start', padding: '2px 4px', color: element.style.color || '#666', fontSize: `${element.style.fontSize || 10}px` }}>{element.content}</div>;
        case 'panel':
          return <div style={{ width: '100%', height: '100%', background: element.style.backgroundColor || '#f8f8f8', borderRadius: `${element.style.borderRadius || 4}px` }} />;
        case 'logo':
        case 'image':
          return element.style.imageUrl
            ? <img src={element.style.imageUrl} alt="Logo" className="w-full h-full object-contain" />
            : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', gap: '4px' }}>
                <IconComponent className="w-8 h-8 text-gray-400" />
                <span style={{ fontSize: '9px', color: '#999' }}>Resim yükle</span>
              </div>
            );
        case 'barcode':
          return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '4px' }}>
              <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', marginBottom: '3px' }}>
                {Array.from({ length: Math.min(element.content.length, 20) }, (_, i) => (
                  <div key={i} style={{ width: '3px', background: '#000', height: `${16 + (i % 4) * 4}px` }} />
                ))}
              </div>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{element.content}</span>
            </div>
          );
        case 'line':
          return <div style={{ width: '100%', height: '100%', background: element.style.backgroundColor || '#000' }} />;
        case 'table':
          return (
            <div style={{ width: '100%', height: '100%', background: '#fff', overflow: 'hidden' }}>
              <div style={{ background: '#f0f0f0', padding: '4px 8px', borderBottom: '1px solid #ccc', fontSize: '10px', fontWeight: 700 }}>Tablo Başlığı</div>
              {[1, 2, 3].map(row => (
                <div key={row} style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
                  {['Alan 1', 'Alan 2', 'Alan 3'].map((col, ci) => (
                    <div key={ci} style={{ flex: 1, padding: '3px 6px', fontSize: '9px', borderRight: ci < 2 ? '1px solid #e5e5e5' : 'none', color: '#666' }}>{col}</div>
                  ))}
                </div>
              ))}
            </div>
          );
        case 'shape':
          return <div style={{ width: '100%', height: '100%', background: element.style.backgroundColor || '#e0e0e0', borderRadius: `${element.style.borderRadius || 0}px` }} />;
        case 'chart':
          return (
            <div style={{ width: '100%', height: '100%', background: '#fff', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#333' }}>Grafik</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '4px 0' }}>
                {[60, 85, 40, 95, 70, 55].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: `hsl(${210 + i * 15}, 70%, 55%)`, height: `${h}%`, borderRadius: '2px 2px 0 0' }} />
                ))}
              </div>
            </div>
          );
        default:
          return <div style={{ padding: '2px 4px', fontSize: '11px' }}>{element.content}</div>;
      }
    };

    const resizeHandles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
    const handlePositions: Record<string, React.CSSProperties> = {
      nw: { top: '-8px', left: '-8px' }, n: { top: '-8px', left: '50%', transform: 'translateX(-50%)' },
      ne: { top: '-8px', right: '-8px' }, w: { left: '-8px', top: '50%', transform: 'translateY(-50%)' },
      e: { right: '-8px', top: '50%', transform: 'translateY(-50%)' }, sw: { bottom: '-8px', left: '-8px' },
      s: { bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }, se: { bottom: '-8px', right: '-8px' },
    };
    const cursorMap: Record<string, string> = {
      nw: 'cursor-nw-resize', n: 'cursor-n-resize', ne: 'cursor-ne-resize',
      w: 'cursor-w-resize', e: 'cursor-e-resize', sw: 'cursor-sw-resize',
      s: 'cursor-s-resize', se: 'cursor-se-resize',
    };

    return (
      <div key={element.id} style={elementStyle} onClick={(e) => handleElementClick(e, element)} onMouseDown={(e) => handleElementDragStart(e, element)}>
        {renderContent()}
        {isSelected && (
          <div style={{ position: 'absolute', top: '-22px', left: 0, background: '#3b82f6', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px 4px 0 0', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
            {element.content ? element.content.substring(0, 24) : element.type}
          </div>
        )}
        {isSelected && resizeHandles.map(handle => (
          <div
            key={handle}
            className={`absolute w-4 h-4 bg-blue-500 border-2 border-white hover:bg-blue-600 hover:scale-110 transition-all duration-150 z-50 ${cursorMap[handle]}`}
            style={handlePositions[handle]}
            onMouseDown={(e) => handleResizeStart(e, element, handle)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 overflow-auto relative">
      <div className="flex items-center justify-center min-h-full overflow-auto">
        <div className="relative" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
          <div className="bg-gray-200 border-r border-b border-gray-300" style={{ width: '30px', height: showRulers ? '30px' : '0px' }} />
          <div className="absolute top-0 left-0">{showRulers && renderHorizontalRuler()}</div>
          <div className="absolute top-0 left-0">{showRulers && renderVerticalRuler()}</div>
          <div className="relative" style={{ marginLeft: '0px', marginTop: '0px' }}>
            <div
              ref={canvasRef}
              className="bg-white shadow-lg border border-gray-300 relative z-10"
              style={{
                width: `${canvasDimensions.width}px`,
                height: `${canvasDimensions.height}px`,
                padding: `${margins.top * scale}px ${margins.right * scale}px ${margins.bottom * scale}px ${margins.left * scale}px`,
                minWidth: `${paperDimensions.width * scale}px`,
                minHeight: `${paperDimensions.height * scale}px`,
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              {snapToGrid && (
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`, backgroundSize: `${gridSize}px ${gridSize}px` }} />
              )}
              {showAlignmentGuides && isDragging && (
                <>
                  {alignmentGuides.vertical.map((x, i) => <div key={`v-${i}`} className="absolute top-0 bottom-0 w-0.5 bg-purple-500 z-40" style={{ left: `${x}px` }} />)}
                  {alignmentGuides.horizontal.map((y, i) => <div key={`h-${i}`} className="absolute left-0 right-0 h-0.5 bg-purple-500 z-40" style={{ top: `${y}px` }} />)}
                </>
              )}
              {/* Band overlay — rendered inside canvas paper when banded mode is active */}
              {designMode === 'banded' && (() => {
                let accY = 0;
                return (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
                    {BANDS.map((band) => {
                      const bandTop = accY;
                      accY += band.height;
                      return (
                        <div
                          key={band.label}
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${bandTop}px`,
                            height: `${band.height}px`,
                            background: `${band.color}0a`,
                            borderBottom: `1.5px dashed ${band.color}60`,
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '52px',
                            background: `${band.color}18`,
                            borderRight: `2px solid ${band.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{
                              writingMode: 'vertical-rl',
                              fontSize: '8px',
                              fontWeight: 700,
                              letterSpacing: '0.07em',
                              color: band.color,
                              textTransform: 'uppercase',
                              userSelect: 'none',
                            }}>
                              {band.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {elements.map(renderElement)}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400" style={{ zIndex: 3 }}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-sm">Öğeleri buraya sürükleyin veya sol panelden ekleyin</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-xs text-gray-700 dark:text-gray-300">
        Canvas: {Math.round(canvasDimensions.width)}×{Math.round(canvasDimensions.height)}px | Zoom: {zoom}%
      </div>
    </div>
  );
};

export default DesignCanvas;
