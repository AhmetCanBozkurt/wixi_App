import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FaDatabase, 
  FaSearch, 
  FaEye, 
  FaEyeSlash, 
  FaPlus, 
  FaMinus, 
  FaCompress, 
  FaKey, 
  FaChevronLeft, 
  FaChevronRight,
  FaMapMarkerAlt,
  FaThList,
  FaSitemap,
  FaSave
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import styles from './DatabaseSchemaPage.module.css';

interface Column {
  name: string;
  dataType: string;
  size?: number | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isNullable: boolean;
}

interface Table {
  name: string;
  recordCount: number;
  columns: Column[];
}

interface Relation {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: string; // "1:1" or "1:N"
}

export const DatabaseSchemaPage = () => {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<Table[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'schema' | 'list'>('schema');
  
  // Canvas State
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [visibleTables, setVisibleTables] = useState<Record<string, boolean>>({});
  
  // Hover and Dragging Ref
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, cardX: 0, cardY: 0 });
  
  // Highlighted relation path
  const [hoveredRelationId, setHoveredRelationId] = useState<string | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);
  const [savingLayout, setSavingLayout] = useState(false);

  // requestAnimationFrame Throttling Refs for Butter-Smooth 60fps/120fps Drag & Pan
  const dragCoordsRef = useRef<{ dx: number; dy: number } | null>(null);
  const panCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Cancel any pending animation frames on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch schema data
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await apiClient.get('schema');
        const data = response.data;
        setTables(data.tables || []);
        setRelations(data.relations || []);
        
        // Initialize positions in a nice grid
        const colsCount = 3;
        const colSpacing = 380;
        const rowSpacing = 480;
        const initialPos: Record<string, { x: number; y: number }> = {};
        const initialVis: Record<string, boolean> = {};

        (data.tables || []).forEach((table: Table, index: number) => {
          const row = Math.floor(index / colsCount);
          const col = index % colsCount;
          initialPos[table.name] = {
            x: 80 + col * colSpacing,
            y: 80 + row * rowSpacing
          };
          initialVis[table.name] = true;
        });

        // Load custom user layout from DB if it exists, merging for robustness
        try {
          const layoutResponse = await apiClient.get('schema/layout');
          if (layoutResponse.data && layoutResponse.data.layoutJson) {
            const savedLayout = JSON.parse(layoutResponse.data.layoutJson);
            
            if (savedLayout.positions) {
              const mergedPos = { ...initialPos, ...savedLayout.positions };
              setPositions(mergedPos);
            } else {
              setPositions(initialPos);
            }

            if (savedLayout.zoom !== undefined) {
              setZoom(savedLayout.zoom);
            }

            if (savedLayout.pan) {
              setPan(savedLayout.pan);
            }

            if (savedLayout.visibleTables) {
              const mergedVis = { ...initialVis, ...savedLayout.visibleTables };
              setVisibleTables(mergedVis);
            } else {
              setVisibleTables(initialVis);
            }
            toast.success('Kişiselleştirilmiş yerleşim şeması yüklendi!');
          } else {
            setPositions(initialPos);
            setVisibleTables(initialVis);
            toast.success('Veritabanı şeması yüklendi.');
          }
        } catch {
          setPositions(initialPos);
          setVisibleTables(initialVis);
          toast.success('Veritabanı şeması yüklendi.');
        }
      } catch (err: unknown) {
        toast.error('Şema yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
  }, []);

  // Filter Tables
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    const query = searchQuery.toLowerCase();
    return tables.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.columns.some(c => c.name.toLowerCase().includes(query))
    );
  }, [tables, searchQuery]);

  // Check if a table matches the search query to highlight it
  const isTableMatched = (tableName: string) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    const t = tables.find(tbl => tbl.name === tableName);
    if (!t) return false;
    return t.name.toLowerCase().includes(query) || t.columns.some(c => c.name.toLowerCase().includes(query));
  };

  // Canvas Mouse Event Handlers for Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking directly on card or buttons, do not pan
    if ((e.target as HTMLElement).closest(`.${styles.tableCard}`) || (e.target as HTMLElement).closest(`.${styles.hud}`) || (e.target as HTMLElement).closest(`.${styles.sidebar}`)) {
      return;
    }
    // Also if clicking on an SVG line or pill, let's not clear selection
    if ((e.target as HTMLElement).closest(`.${styles.svgGroup}`) || (e.target as HTMLElement).closest(`.${styles.relationPill}`)) {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setSelectedRelationId(null); // Clear selected relation when clicking empty workspace background
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      const nextX = e.clientX - panStart.x;
      const nextY = e.clientY - panStart.y;
      panCoordsRef.current = { x: nextX, y: nextY };
      
      if (!animFrameIdRef.current) {
        animFrameIdRef.current = requestAnimationFrame(() => {
          if (panCoordsRef.current) {
            setPan(panCoordsRef.current);
            panCoordsRef.current = null;
          }
          animFrameIdRef.current = null;
        });
      }
    } else if (draggedTable) {
      // Dragging card calculation considering zoom level
      const dx = (e.clientX - dragStart.current.mouseX) / zoom;
      const dy = (e.clientY - dragStart.current.mouseY) / zoom;
      dragCoordsRef.current = { dx, dy };
      
      if (!animFrameIdRef.current) {
        animFrameIdRef.current = requestAnimationFrame(() => {
          if (dragCoordsRef.current && draggedTable) {
            const { dx: currentDx, dy: currentDy } = dragCoordsRef.current;
            setPositions(prev => ({
              ...prev,
              [draggedTable]: {
                x: dragStart.current.cardX + currentDx,
                y: dragStart.current.cardY + currentDy
              }
            }));
            dragCoordsRef.current = null;
          }
          animFrameIdRef.current = null;
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedTable(null);
    dragCoordsRef.current = null;
    panCoordsRef.current = null;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  };

  // Zooming centered on mouse cursor
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Canvas coordinate of mouse cursor before zooming
    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;

    const zoomStep = 0.08;
    const newZoom = Math.max(0.15, Math.min(2.0, zoom + (e.deltaY < 0 ? zoomStep : -zoomStep)));

    const newPanX = mouseX - canvasX * newZoom;
    const newPanY = mouseY - canvasY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Card Drag Handlers
  const handleCardDragStart = (tableName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const pos = positions[tableName] || { x: 0, y: 0 };
    setDraggedTable(tableName);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cardX: pos.x,
      cardY: pos.y
    };
  };

  // Case-insensitive Visible Columns height map (Header = 50px, Column Row = 36px)
  const getColumnVerticalOffset = (table: Table, columnName: string) => {
    const colIndex = table.columns.findIndex(c => c.name.toLowerCase() === columnName.toLowerCase());
    if (colIndex === -1) return 50 + 18;
    return 50 + colIndex * 36 + 18;
  };

  // Calculate connection lines coordinate paths with CASE-INSENSITIVE Table name support
  const connectionPaths = useMemo(() => {
    return relations.map(rel => {
      const { fromTable, fromColumn, toTable, toColumn, type } = rel;
      
      // Case-insensitive lookup of source and destination tables
      const fromTbl = tables.find(t => t.name.toLowerCase() === fromTable.toLowerCase());
      const toTbl = tables.find(t => t.name.toLowerCase() === toTable.toLowerCase());
      if (!fromTbl || !toTbl) return null;

      // Skip if either table is hidden or position unknown
      const isFromVisible = visibleTables[fromTbl.name] ?? true;
      const isToVisible = visibleTables[toTbl.name] ?? true;
      const fromPos = positions[fromTbl.name];
      const toPos = positions[toTbl.name];

      if (!isFromVisible || !isToVisible || !fromPos || !toPos) {
        return null;
      }

      const fromOffset = getColumnVerticalOffset(fromTbl, fromColumn);
      const toOffset = getColumnVerticalOffset(toTbl, toColumn);

      const cardWidth = 290;
      let x1 = 0, y1 = fromPos.y + fromOffset;
      let x2 = 0, y2 = toPos.y + toOffset;

      // Determine left/right connector anchor point based on relative positions
      if (fromPos.x + cardWidth / 2 < toPos.x + cardWidth / 2) {
        x1 = fromPos.x + cardWidth;
        x2 = toPos.x;
      } else {
        x1 = fromPos.x;
        x2 = toPos.x + cardWidth;
      }

      // Bezier line math
      const dx = Math.abs(x2 - x1);
      const offset = Math.min(dx / 2, 90);
      const cp1 = x1 + (x2 > x1 ? offset : -offset);
      const cp2 = x2 - (x2 > x1 ? offset : -offset);
      
      const path = `M ${x1} ${y1} C ${cp1} ${y1}, ${cp2} ${y2}, ${x2} ${y2}`;
      
      // Midpoint for the hover pill badge
      const xMid = (x1 + x2) / 2;
      const yMid = (y1 + y2) / 2;

      const relId = `${fromTbl.name}-${fromColumn}-${toTbl.name}-${toColumn}`;

      return {
        id: relId,
        path,
        xMid,
        yMid,
        fromTable: fromTbl.name,
        toTable: toTbl.name,
        type,
        visible: true
      };
    }).filter(Boolean);
  }, [relations, positions, visibleTables, tables]);

  // Reset Canvas View
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 50, y: 50 });
    toast.success('Tuval görünümü sıfırlandı.');
  };

  // Save Canvas Layout to Database
  const handleSaveLayout = async () => {
    setSavingLayout(true);
    try {
      const layoutData = {
        positions,
        zoom,
        pan,
        visibleTables
      };
      await apiClient.post('schema/layout', {
        layoutJson: JSON.stringify(layoutData)
      });
      toast.success('Mevcut şema yerleşimi başarıyla kaydedildi!');
    } catch (error) {
      toast.error('Şema yerleşimi kaydedilirken bir hata oluştu.');
    } finally {
      setSavingLayout(false);
    }
  };

  // Zoom In / Out
  const adjustZoom = (amount: number) => {
    setZoom(prev => Math.max(0.15, Math.min(2.0, prev + amount)));
  };

  // Toggle Table Visibility
  const toggleVisibility = (tableName: string) => {
    setVisibleTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  // Toggle All Tables Visibility
  const toggleAllVisibility = (val: boolean) => {
    const nextVis: Record<string, boolean> = {};
    tables.forEach(t => {
      nextVis[t.name] = val;
    });
    setVisibleTables(nextVis);
  };

  // Group connection paths into background (passing behind cards) and foreground (passing in front)
  const backgroundConnections = useMemo(() => {
    return connectionPaths.filter(c => c && c.id !== selectedRelationId);
  }, [connectionPaths, selectedRelationId]);

  const foregroundConnections = useMemo(() => {
    return connectionPaths.filter(c => c && c.id === selectedRelationId);
  }, [connectionPaths, selectedRelationId]);

  const activeConn = useMemo(() => {
    return connectionPaths.find(c => c && c.id === selectedRelationId);
  }, [connectionPaths, selectedRelationId]);

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinner}></div>
        <p>Veritabanı modeli analiz ediliyor ve şema çıkartılıyor...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Sidebar Toggle Float Button when Sidebar is closed */}
      {!sidebarOpen && (
        <button 
          className={styles.toggleSidebarFloatBtn} 
          onClick={() => setSidebarOpen(true)}
          title="Sidebar Aç"
        >
          <FaChevronRight />
        </button>
      )}

      {/* ─── SIDEBAR CONTROL PANEL ──────────────────────── */}
      <div className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', width: '100%', gap: '8px' }}>
            <h2><FaDatabase /> Wixi Schema ERD</h2>
            <button 
              className={styles.toggleShowBtn} 
              onClick={() => setSidebarOpen(false)}
              title="Sidebar Kapat"
            >
              <FaChevronLeft />
            </button>
          </div>
          <p>Veritabanı tablolarını arayın, filtreleyin ve şema üzerinde gizleyin/gösterin.</p>
          
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tablo veya kolon ara..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Toggle Tab View Mode Selector */}
          <div className={styles.viewToggleGroup}>
            <button 
              className={`${styles.viewToggleBtn} ${viewMode === 'schema' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('schema')}
              title="ER Şema Görünümü"
            >
              <FaSitemap /> Şema
            </button>
            <button 
              className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('list')}
              title="Tablo Listesi Görünümü"
            >
              <FaThList /> Liste
            </button>
          </div>

          {viewMode === 'schema' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <button 
                className={styles.hudBtn} 
                style={{ fontSize: '0.72rem', width: 'auto', padding: '0 8px', display: 'flex', gap: '4px', height: '26px' }}
                onClick={() => toggleAllVisibility(true)}
              >
                Tümünü Göster
              </button>
              <button 
                className={styles.hudBtn} 
                style={{ fontSize: '0.72rem', width: 'auto', padding: '0 8px', display: 'flex', gap: '4px', height: '26px' }}
                onClick={() => toggleAllVisibility(false)}
              >
                Tümünü Gizle
              </button>
            </div>
          )}
        </div>

        <div className={styles.sidebarList}>
          {filteredTables.map(table => {
            const isVisible = visibleTables[table.name] ?? true;
            const isMatched = isTableMatched(table.name);

            return (
              <div 
                key={table.name} 
                className={`${styles.sidebarItem} ${isMatched ? styles.sidebarItemActive : ''}`}
                onClick={() => {
                  if (viewMode === 'list') {
                    // Scroll to the list card in list view
                    const element = document.getElementById(`list-table-${table.name}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      element.classList.add(styles.listTableCardGlow);
                      setTimeout(() => element.classList.remove(styles.listTableCardGlow), 2000);
                    }
                  } else {
                    // Zoom / pan to table card center in schema view
                    const pos = positions[table.name];
                    if (pos) {
                      setVisibleTables(prev => ({ ...prev, [table.name]: true }));
                      if (containerRef.current) {
                        const rect = containerRef.current.getBoundingClientRect();
                        setPan({
                          x: rect.width / 2 - pos.x * zoom - 145 * zoom,
                          y: rect.height / 2 - pos.y * zoom - 150 * zoom
                        });
                      }
                    }
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.sidebarTableName}>{table.name}</span>
                  <span className={styles.sidebarTableCount}>{table.recordCount}</span>
                </div>
                
                {viewMode === 'schema' && (
                  <button 
                    className={styles.toggleShowBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(table.name);
                    }}
                    title={isVisible ? 'Tabloyu Gizle' : 'Tabloyu Göster'}
                  >
                    {isVisible ? <FaEye /> : <FaEyeSlash style={{ color: 'var(--text-muted)' }} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── CANVAS WORKSPACE ───────────────────────────── */}
      {viewMode === 'schema' ? (
        <div 
          ref={containerRef}
          className={`${styles.workspace} ${isPanning ? styles.canvasGrabbing : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div 
            className={styles.canvas}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* Infinite SVG Connection Lines Overlay Layer (Background SVG: drawn behind cards) */}
            <svg 
              className={styles.svgCanvas} 
              viewBox="-10000 -10000 20000 20000"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
                </marker>
              </defs>

              {backgroundConnections.map(conn => {
                if (!conn) return null;
                
                const isHovered = hoveredRelationId === conn.id || selectedRelationId === conn.id;
                
                // If query matches a table, and this line doesn't connect to that table, dim it
                const hasSearchActive = searchQuery.trim().length > 0;
                const connectsToMatch = hasSearchActive && (isTableMatched(conn.fromTable) || isTableMatched(conn.toTable));
                const isDimmed = hasSearchActive && !connectsToMatch;

                return (
                  <g 
                    key={conn.id} 
                    className={styles.svgGroup}
                    onMouseEnter={() => setHoveredRelationId(conn.id)}
                    onMouseLeave={() => setHoveredRelationId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRelationId(conn.id);
                    }}
                  >
                    {/* Invisible thicker stroke wrapper for easy hover and click detection */}
                    <path
                      d={conn.path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                      style={{ cursor: 'pointer' }}
                    />
                    {/* The visual connection line */}
                    <path
                      d={conn.path}
                      className={`${isHovered ? styles.relationshipLineHovered : styles.relationshipLine} ${isDimmed ? styles.lineDim : ''}`}
                      markerEnd="url(#arrow)"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Render Midpoint Relationship Pill Badges on top of SVG lines but below cards */}
            {connectionPaths.map(conn => {
              if (!conn) return null;
              const isHovered = hoveredRelationId === conn.id || selectedRelationId === conn.id;
              
              const hasSearchActive = searchQuery.trim().length > 0;
              const connectsToMatch = hasSearchActive && (isTableMatched(conn.fromTable) || isTableMatched(conn.toTable));
              const isDimmed = hasSearchActive && !connectsToMatch;
              if (isDimmed) return null;

              return (
                <div
                  key={`pill-${conn.id}`}
                  className={`${styles.relationPill} ${isHovered ? styles.relationPillVisible : ''}`}
                  style={{
                    left: conn.xMid,
                    top: conn.yMid,
                  }}
                  onMouseEnter={() => setHoveredRelationId(conn.id)}
                  onMouseLeave={() => setHoveredRelationId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRelationId(conn.id);
                  }}
                  title={`${conn.fromTable} (${conn.type}) ${conn.toTable}`}
                >
                  {conn.type}
                </div>
              );
            })}

            {/* ─── DRAGGABLE TABLE CARDS ─────────────────────── */}
            {tables.map(table => {
              const isVisible = visibleTables[table.name] ?? true;
              if (!isVisible) return null;

              const pos = positions[table.name] || { x: 0, y: 0 };
              
              // Search match state
              const hasSearch = searchQuery.trim().length > 0;
              const isMatched = isTableMatched(table.name);
              
              // Determine active relation connection state
              const isConnectedToActive = activeConn && (activeConn.fromTable === table.name || activeConn.toTable === table.name);
              const isCardActive = isMatched || isConnectedToActive;
              
              // Dim cards if search is active and card is not matched, OR if a connection is active/hovered and card is not part of it
              const isDimmed = 
                (hasSearch && !isMatched) || 
                ((hoveredRelationId || selectedRelationId) && !isCardActive);

              return (
                <div
                  key={table.name}
                  className={`${styles.tableCard} ${isCardActive ? styles.highlight : ''} ${isDimmed ? styles.dim : ''}`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                  }}
                >
                  {/* Header (Drag anchor) */}
                  <div 
                    className={`${styles.tableCardHeader} ${draggedTable === table.name ? styles.tableCardHeaderActive : ''}`}
                    onMouseDown={(e) => handleCardDragStart(table.name, e)}
                  >
                    <h3 title={table.name}>{table.name}</h3>
                    <span className={styles.recordCountBadge}>{table.recordCount} satır</span>
                  </div>

                  {/* Body (Columns list) */}
                  <div className={styles.tableCardBody}>
                    {table.columns.map(col => {
                      const isMatchedCol = searchQuery.trim() && col.name.toLowerCase().includes(searchQuery.toLowerCase());
                      return (
                        <div 
                          key={col.name} 
                          className={styles.columnRow}
                          style={isMatchedCol ? { backgroundColor: 'rgba(6, 182, 212, 0.08)' } : {}}
                        >
                          <div className={styles.columnLeft}>
                            {col.isPrimaryKey ? (
                              <span className={`${styles.keyIcon} ${styles.keyIconPK}`} title="Primary Key">
                                <FaKey />
                              </span>
                            ) : col.isForeignKey ? (
                              <span className={`${styles.keyIcon} ${styles.keyIconFK}`} title="Foreign Key">
                                <FaKey />
                              </span>
                            ) : (
                              <span className={styles.keyIconNone}></span>
                            )}
                            <span className={`${styles.columnName} ${col.isPrimaryKey ? styles.columnNamePK : ''}`} title={col.name}>
                                {col.name}
                            </span>
                          </div>

                          <div className={styles.columnRight}>
                            <span className={styles.columnType} title={col.dataType}>
                              {col.dataType.toLowerCase()}
                              {col.size && col.size > 0 ? `(${col.size})` : ''}
                            </span>
                            
                            {col.isPrimaryKey ? (
                              <span className={`${styles.columnBadge} ${styles.badgeNotNull}`}>PK</span>
                            ) : col.isUnique ? (
                              <span className={`${styles.columnBadge} ${styles.badgeUnique}`}>UQ</span>
                            ) : col.isNullable ? (
                              <span className={`${styles.columnBadge} ${styles.badgeNullable}`}>NULL</span>
                            ) : (
                              <span className={`${styles.columnBadge} ${styles.badgeNotNull}`}>NN</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Infinite SVG Connection Lines Foreground Layer (drawn IN FRONT OF cards for active/hovered relationships) */}
            {foregroundConnections.length > 0 && (
              <svg 
                className={styles.svgCanvasForeground} 
                viewBox="-10000 -10000 20000 20000"
              >
                <defs>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
                  </marker>
                </defs>
                {foregroundConnections.map(conn => {
                  if (!conn) return null;
                  
                  return (
                    <g 
                      key={`fg-${conn.id}`} 
                      className={styles.svgGroup}
                      onMouseEnter={() => setHoveredRelationId(conn.id)}
                      onMouseLeave={() => setHoveredRelationId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRelationId(conn.id);
                      }}
                    >
                      {/* Invisible thicker stroke wrapper for easy hover/click detection on foreground */}
                      <path
                        d={conn.path}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                        style={{ cursor: 'pointer' }}
                      />
                      {/* The visual foreground connection line (always glowing and active) */}
                      <path
                        d={conn.path}
                        className={styles.relationshipLineHovered}
                        markerEnd="url(#arrow-active)"
                      />
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      ) : (
        /* ─── LIST VIEW CONTAINER (TABULAR DETAILS) ──────── */
        <div className={styles.listViewContainer}>
          <div className={styles.listViewGrid}>
            {filteredTables.map(table => {
              const isMatched = isTableMatched(table.name);
              return (
                <div 
                  key={table.name} 
                  id={`list-table-${table.name}`}
                  className={`${styles.listTableCard} ${isMatched ? styles.listTableCardActive : ''}`}
                >
                  <div className={styles.listTableCardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaDatabase className={styles.listTableIcon} />
                      <h3>{table.name}</h3>
                    </div>
                    <span className={styles.recordCountBadge}>{table.recordCount} satır</span>
                  </div>

                  <div className={styles.listTableCardBody}>
                    <table className={styles.listColTable}>
                      <thead>
                        <tr>
                          <th>Kolon Adı</th>
                          <th>Veri Tipi</th>
                          <th>Anahtar</th>
                          <th>Nullable</th>
                          <th>Unique</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map(col => {
                          const isMatchedCol = searchQuery.trim() && col.name.toLowerCase().includes(searchQuery.toLowerCase());
                          return (
                            <tr 
                              key={col.name} 
                              className={isMatchedCol ? styles.listColRowMatched : ''}
                            >
                              <td className={`${styles.listColNameCell} ${col.isPrimaryKey ? styles.listColPKName : ''}`}>
                                {col.name}
                              </td>
                              <td>
                                <code className={styles.listColType}>
                                  {col.dataType}
                                  {col.size && col.size > 0 ? `(${col.size})` : ''}
                                </code>
                              </td>
                              <td>
                                {col.isPrimaryKey && <span className={`${styles.columnBadge} ${styles.badgeNotNull}`}>PK</span>}
                                {col.isForeignKey && <span className={`${styles.columnBadge} ${styles.badgeUnique}`} style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#a7f3d0', border: '1px solid rgba(52, 211, 153, 0.2)' }}>FK</span>}
                                {!col.isPrimaryKey && !col.isForeignKey && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                              </td>
                              <td>
                                <span className={col.isNullable ? styles.listTextNullable : styles.listTextNotNull}>
                                  {col.isNullable ? 'Evet' : 'Hayır'}
                                </span>
                              </td>
                              <td>
                                <span>{col.isUnique ? 'Evet' : 'Hayır'}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── HUD / CANVAS NAVIGATION CONTROLS ───────────── */}
      {viewMode === 'schema' && (
        <div className={styles.hud}>
          <div className={styles.hudGroup}>
            <button 
              className={styles.hudBtn} 
              onClick={() => adjustZoom(0.1)} 
              title="Yakınlaştır (+)"
            >
              <FaPlus />
            </button>
            <span className={styles.zoomLevelText}>{Math.round(zoom * 100)}%</span>
            <button 
              className={styles.hudBtn} 
              onClick={() => adjustZoom(-0.1)} 
              title="Uzaklaştır (-)"
            >
              <FaMinus />
            </button>
          </div>

          <div className={styles.hudGroup}>
            <button 
              className={styles.hudBtn} 
              onClick={handleResetView} 
              title="Görünümü Ortala ve Sıfırla"
            >
              <FaCompress />
            </button>
            <button 
              className={`${styles.hudBtn} ${styles.hudSaveBtn}`} 
              onClick={handleSaveLayout} 
              title="Mevcut Yerleşimi Kaydet"
              disabled={savingLayout}
            >
              {savingLayout ? <div className={styles.miniSpinner}></div> : <FaSave />}
            </button>
          </div>
          
          <div className={styles.hudGroup} style={{ padding: '8px 12px', fontSize: '0.75rem', gap: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaMapMarkerAlt style={{ color: '#fbbf24' }} /> PK (Birincil)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaMapMarkerAlt style={{ color: '#34d399' }} /> FK (Yabancı)</span>
          </div>
        </div>
      )}

    </div>
  );
};
