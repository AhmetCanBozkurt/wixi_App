import React, {
  useState, useMemo, useCallback, useRef, useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import {
  FaSearch, FaTimes, FaColumns, FaFileExcel, FaFilePdf,
  FaGripVertical, FaEllipsisH, FaLayerGroup, FaSort,
  FaSortUp, FaSortDown, FaFilter, FaChevronLeft, FaChevronRight,
  FaAngleRight, FaAngleDown, FaEye, FaEdit, FaTrashAlt,
} from 'react-icons/fa';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove, SortableContext, horizontalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiClient } from '../../api/axiosConfig';
import styles from './AdvancedDataTable.module.css';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface ColumnConfig<T = any> {
  field: string;
  title: string;
  width?: number;
  minWidth?: number;
  template?: (dataItem: T) => React.ReactNode;
  headerTemplate?: () => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  locked?: boolean;
  attributes?: React.HTMLAttributes<HTMLTableCellElement>;
}

export interface GridOptions<T = any> {
  dataSource: T[] | string;
  columns: ColumnConfig<T>[];
  pageable?: boolean | { pageSize?: number; pageSizes?: number[] };
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  reorderable?: boolean;
  resizable?: boolean;
  selectable?: boolean;
  toolbar?: ('search' | 'excel' | 'pdf' | 'create')[];
  height?: string | number;
  onDataBound?: (data: T[]) => void;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onDetail?: (row: T) => void;
  detailModal?: (row: T, onClose: () => void) => React.ReactNode;
  searchParams?: Record<string, any>;
}

// ─── Utility ───────────────────────────────────────────────────────────────
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, p) => acc?.[p], obj);
}

// ─── Sortable Header ────────────────────────────────────────────────────────
function SortableHeaderCell({
  col, sortField, sortDir, onSortClick, onMenuOpen, onResizeStart, filterValue, onFilterChange, filterable,
}: {
  col: ColumnConfig;
  sortField: string | null;
  sortDir: 'asc' | 'desc';
  onSortClick: (field: string) => void;
  onMenuOpen: (field: string, rect: DOMRect) => void;
  onResizeStart: (e: React.MouseEvent, field: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.field });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    width: col.width,
    minWidth: col.minWidth ?? 80,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
  };

  const isActive = sortField === col.field;

  return (
    <th ref={setNodeRef} style={style} className={`${styles.th} ${col.locked ? styles.lockedCol : ''}`}>
      <div className={styles.thInner}>
        {/* Drag handle */}
        <span className={styles.grip} {...attributes} {...listeners}><FaGripVertical /></span>

        {/* Title + sort */}
        <span className={styles.thTitle} onClick={() => onSortClick(col.field)}>
          {col.title || String(col.field)}
          <span className={styles.sortIcon}>
            {!isActive && <FaSort />}
            {isActive && sortDir === 'asc' && <FaSortUp />}
            {isActive && sortDir === 'desc' && <FaSortDown />}
          </span>
        </span>

        {/* Column menu trigger */}
        <button className={styles.thMenu} onClick={(e) => onMenuOpen(col.field, e.currentTarget.getBoundingClientRect())}>
          <FaEllipsisH />
        </button>

        {/* Resize handle */}
        <div className={styles.resizeHandle} onMouseDown={(e) => onResizeStart(e, col.field)} />
      </div>

      {/* Kendo-style filter row */}
      {filterable && (
        <div className={styles.filterRow}>
          <FaSearch className={styles.filterIcon} />
          <input
            className={styles.filterInput}
            value={filterValue}
            onChange={e => onFilterChange(e.target.value)}
            placeholder="Filtre..."
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </th>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function AdvancedDataTable<T extends Record<string, any>>(options: GridOptions<T>) {
  const {
    dataSource, columns: initialCols, pageable, sortable = true, filterable = false,
    groupable = false, reorderable = true, resizable = true, selectable = false,
    toolbar = [], height, onDataBound, onRowClick, onEdit, onDelete, detailModal,
    searchParams = {},
    onDetail,
  } = options;

  const isRemote = typeof dataSource === 'string';

  /* ── State ── */
  const [columns, setColumns] = useState<ColumnConfig<T>[]>(initialCols);
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    initialCols.forEach(c => { w[c.field] = c.width ?? 150; });
    return w;
  });
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
    const v: Record<string, boolean> = {};
    initialCols.forEach(c => { v[c.field] = !c.hidden; });
    return v;
  });

  const [remoteData, setRemoteData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const initPageSize = typeof pageable === 'object' ? (pageable.pageSize ?? 20) : 20;
  const pageSizeOptions = typeof pageable === 'object' ? (pageable.pageSizes ?? [10, 20, 50]) : [10, 20, 50];
  const [pageSize, setPageSize] = useState(initPageSize);

  const [globalSearch, setGlobalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const [groupedFields, setGroupedFields] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const [activeColMenu, setActiveColMenu] = useState<{ field: string; rect: DOMRect } | null>(null);
  const [colChooserRect, setColChooserRect] = useState<DOMRect | null>(null);
  const [rowMenuState, setRowMenuState] = useState<{ row: T; rect: DOMRect } | null>(null);
  const [detailRow, setDetailRow] = useState<T | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const colMenuRef = useRef<HTMLDivElement>(null);
  const chooserRef = useRef<HTMLDivElement>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<{ field: string; startX: number; startW: number } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // ── Debounce ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(globalSearch), 400);
    return () => clearTimeout(t);
  }, [globalSearch]);

  // ── Sync columns if they change from parent ──
  useEffect(() => {
    setColumns(initialCols);
    setColWidths(prev => {
      const w = { ...prev };
      initialCols.forEach(c => { if (w[c.field] === undefined) w[c.field] = c.width ?? 150; });
      return w;
    });
    setVisibleCols(prev => {
      const v = { ...prev };
      initialCols.forEach(c => { if (v[c.field] === undefined) v[c.field] = !c.hidden; });
      return v;
    });
  }, [initialCols]);

  // ── Outside click to close menus ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (colMenuRef.current && !colMenuRef.current.contains(t)) setActiveColMenu(null);
      if (chooserRef.current && !chooserRef.current.contains(t)) setColChooserRect(null);
      if (rowMenuRef.current && !rowMenuRef.current.contains(t)) setRowMenuState(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Resize column ──
  const handleResizeStart = useCallback((e: React.MouseEvent, field: string) => {
    e.preventDefault();
    resizingRef.current = { field, startX: e.clientX, startW: colWidths[field] };
    const onMove = (me: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = me.clientX - resizingRef.current.startX;
      setColWidths(prev => ({
        ...prev,
        [resizingRef.current!.field]: Math.max(60, resizingRef.current!.startW + delta),
      }));
    };
    const onUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [colWidths]);

  // ── Sort (3-state: none → asc → desc → none) ──
  const handleSort = (field: string) => {
    if (sortField !== field) {
      setSortField(field); setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      // 3rd click: clear sort
      setSortField(null); setSortDir('asc');
    }
    setPage(1);
  };

  // ── Remote fetch ──
  const fetchData = useCallback(async () => {
    if (!isRemote) return;
    setLoading(true);
    try {
      const params: any = {
        page, pageSize,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(sortField ? { sortBy: sortField, sortOrder: sortDir } : {}),
        ...searchParams,
      };
      Object.entries(columnFilters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await apiClient.get(dataSource as string, { params });
      const result = res.data;
      const items: T[] = result.items ?? result.data ?? result;
      setRemoteData(items);
      setTotal(result.totalCount ?? result.total ?? items.length);
      onDataBound?.(items);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }, [isRemote, dataSource, page, pageSize, debouncedSearch, sortField, sortDir, JSON.stringify(columnFilters), JSON.stringify(searchParams)]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Client-side processing ──
  const processedData = useMemo(() => {
    if (isRemote) {
       return remoteData;
    }
    let d = Array.isArray(dataSource) ? [...dataSource] : [];
    
    // Safety check: if data source is empty but was supposed to be there
    if (d.length === 0 && dataSource && (dataSource as any).length > 0) {
       d = [...(dataSource as any)];
    }

    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      d = d.filter(r => {
        return Object.values(r).some(v => {
          if (v === null || v === undefined) return false;
          return String(v).toLowerCase().includes(q);
        });
      });
    }
    Object.entries(columnFilters).forEach(([field, val]) => {
      if (val) d = d.filter(r => String(getNestedValue(r, field) ?? '').toLowerCase().includes(val.toLowerCase()));
    });
    if (sortField) {
      d.sort((a, b) => {
        const av = getNestedValue(a, sortField) ?? '';
        const bv = getNestedValue(b, sortField) ?? '';
        const cmp = String(av).localeCompare(String(bv), 'tr', { numeric: true, sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return d;
  }, [isRemote, remoteData, dataSource, debouncedSearch, columnFilters, sortField, sortDir, loading]);



  const applyGrouping = (items: T[], gFields: string[]): any[] => {
    const grouped = (data: T[], level: number, parentKey: string): any[] => {
      if (level >= gFields.length) return data;
      const field = gFields[level];
      const map = new Map<string, T[]>();
      data.forEach(item => {
        const val = String(getNestedValue(item, field) ?? 'N/A');
        if (!map.has(val)) map.set(val, []);
        map.get(val)!.push(item);
      });
      const res: any[] = [];
      map.forEach((rows, val) => {
        const groupKey = `${parentKey}::${val}`;
        res.push({ __group: true, level, field, value: val, count: rows.length, groupKey });
        if (!collapsedGroups.has(groupKey)) {
          res.push(...grouped(rows, level + 1, groupKey));
        }
      });
      return res;
    };
    return grouped(items, 0, 'root');
  };

  // ── Group + Paginate ──
  const displayRows = useMemo(() => {
    let d = [...processedData];
    
    // Grouping logic (simplified and robust)
    if (groupable && groupedFields.length > 0) {
      d = applyGrouping(d, groupedFields);
    }

    const safePageSize = pageSize > 0 ? pageSize : 20;
    const maxPage = Math.max(1, Math.ceil(d.length / safePageSize));
    const safePage = page > maxPage ? 1 : page;
    
    // Auto-reset page if out of bounds (but don't trigger re-render in useMemo, this is for display)
    const start = (safePage - 1) * safePageSize;
    const end = start + safePageSize;
    
    const result = d.slice(start, end);
    onDataBound?.(result);
    return result;
  }, [processedData, page, pageSize, collapsedGroups, groupedFields, groupable]);

  const totalCount = isRemote ? total : processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const activeCols = useMemo(() => columns.filter(c => visibleCols[c.field]), [columns, visibleCols]);

  // ── Drag handlers ──
  const handleDragStart = (e: DragStartEvent) => setDraggingId(String(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = e;
    if (!over) return;
    if (groupable && String(over.id) === '__groupzone__') {
      const field = String(active.id);
      if (!groupedFields.includes(field)) setGroupedFields(prev => [...prev, field]);
      return;
    }
    if (reorderable && active.id !== over.id) {
      setColumns(prev => {
        const oi = prev.findIndex(c => c.field === active.id);
        const ni = prev.findIndex(c => c.field === over.id);
        return arrayMove(prev, oi, ni);
      });
    }
  };

  // ── Row selection (ID based for persistence) ──
  const toggleRow = (row: T) => {
    const id = row.id ?? JSON.stringify(row); // fallback for rows without id
    setSelectedRows(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    const currentIds = displayRows.filter(r => !r.__group).map(r => r.id ?? JSON.stringify(r));
    const allSelected = currentIds.every(id => selectedRows.has(id));
    
    setSelectedRows(prev => {
      const n = new Set(prev);
      if (allSelected) {
        currentIds.forEach(id => n.delete(id));
      } else {
        currentIds.forEach(id => n.add(id));
      }
      return n;
    });
  };

  const getExportData = () => {
    // Selection has priority
    const baseData = selectedRows.size > 0 
      ? processedData.filter(row => selectedRows.has(row.id ?? JSON.stringify(row)))
      : processedData;

    return baseData.map(row => {
      const entry: any = {};
      activeCols.forEach(col => {
        entry[col.title] = getNestedValue(row, col.field);
      });
      return entry;
    });
  };

  const handleExportExcel = () => {
    try {
      const exportData = processedData.map(row => {
        const entry: any = {};
        activeCols.forEach(col => {
          const val = getNestedValue(row, col.field);
          // If it's a base64 image, don't dump the text
          entry[col.title] = String(val).startsWith('data:image') ? '[Görsel]' : val;
        });
        return entry;
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, "Export.xlsx");
      toast.success(selectedRows.size > 0 ? `${selectedRows.size} seçili kayıt Excel'e aktarıldı.` : "Tüm liste Excel'e aktarıldı.");
      
      // Log export activity
      apiClient.post('/audit/log-activity', {
        action: 'EXPORT_EXCEL',
        tableName: isRemote ? String(dataSource) : 'ClientData',
        details: `Kullanıcı ${processedData.length} kaydı Excel'e aktardı.`
      }).catch(() => {});
    } catch (error) {
      toast.error("Excel dışa aktarma hatası!");
    }
  };

  const handleExportPDF = () => {
    try {
      const trCharFix = (str: string) => {
        return str
          .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
          .replace(/ü/g, 'u').replace(/Ü/g, 'U')
          .replace(/ş/g, 's').replace(/Ş/g, 'S')
          .replace(/ı/g, 'i').replace(/İ/g, 'I')
          .replace(/ö/g, 'o').replace(/Ö/g, 'O')
          .replace(/ç/g, 'c').replace(/Ç/g, 'C');
      };

      const baseData = selectedRows.size > 0 
        ? processedData.filter(row => selectedRows.has(row.id ?? JSON.stringify(row)))
        : processedData;

      const doc = new jsPDF('l', 'mm', 'a4');
      
      // We need to keep raw values for didDrawCell to check if it's an image
      const tableBody = baseData.map(row => 
        activeCols.map(col => {
          const val = getNestedValue(row, col.field);
          return {
            content: String(val).startsWith('data:image') ? '' : trCharFix(String(val || '-')),
            raw: val
          };
        })
      );
      
      const tableHeaders = activeCols.map(col => trCharFix(col.title));

      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody.map(r => r.map(c => c.content)), // Clean text for main body
        theme: 'striped',
        styles: { fontSize: 8, valign: 'middle' },
        headStyles: { fillColor: [0, 242, 254], textColor: [0, 0, 0] },
        didDrawCell: (data) => {
          if (data.section === 'body') {
            const rawValue = tableBody[data.row.index][data.column.index].raw;
            if (String(rawValue).startsWith('data:image')) {
              try {
                // Draw miniature image in the center of the cell
                doc.addImage(String(rawValue), 'PNG', data.cell.x + 2, data.cell.y + 2, 6, 6);
              } catch (e) {
                // fallback if image is corrupted
              }
            }
          }
        }
      });
      doc.save("Export.pdf");
      toast.success(selectedRows.size > 0 ? `${selectedRows.size} seçili kayıt PDF'e aktarıldı.` : "Tüm liste PDF'e aktarıldı.");

      // Log export activity
      apiClient.post('/audit/log-activity', {
        action: 'EXPORT_PDF',
        tableName: isRemote ? String(dataSource) : 'ClientData',
        details: `Kullanıcı ${baseData.length} kaydı PDF'e aktardı.`
      }).catch(() => {});
    } catch (error) {
      toast.error("PDF dışa aktarma hatası!");
    }
  };

  return (
    <div className={styles.wrapper} style={{ height }}>

      {/* ── Toolbar ────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {toolbar.includes('excel') && (
            <button className={styles.tbBtn} onClick={handleExportExcel}><FaFileExcel /><span>Excel</span></button>
          )}
          {toolbar.includes('pdf') && (
            <button className={styles.tbBtn} onClick={handleExportPDF}><FaFilePdf /><span>PDF</span></button>
          )}

          {/* Groupable Zone */}
          {groupable && (
            <SortableContext items={['__groupzone__']} strategy={horizontalListSortingStrategy}>
              <div
                id="__groupzone__"
                className={`${styles.groupZone} ${draggingId ? styles.groupZoneActive : ''}`}
              >
                <FaLayerGroup />
                {groupedFields.length === 0
                  ? <span className={styles.groupZonePlaceholder}>Gruplamak için sütun başlığını buraya sürükleyin</span>
                  : groupedFields.map(f => (
                    <span key={f} className={styles.groupTag}>
                      {columns.find(c => c.field === f)?.title}
                      <button onClick={() => setGroupedFields(prev => prev.filter(x => x !== f))}><FaTimes /></button>
                    </span>
                  ))
                }
              </div>
            </SortableContext>
          )}
        </div>

        <div className={styles.toolbarRight}>
          {toolbar.includes('search') && (
            <div className={styles.searchBox}>
              <FaSearch />
              <input placeholder="Ara..." value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} />
              {globalSearch && <FaTimes className={styles.clearSearch} onClick={() => setGlobalSearch('')} />}
            </div>
          )}
          <button
            className={styles.tbBtn}
            onClick={e => setColChooserRect(e.currentTarget.getBoundingClientRect())}
            title="Sütunları Seç"
          >
            <FaColumns />
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      <div className={styles.tableScroll}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <table className={styles.table}>
            <thead>
              <SortableContext items={activeCols.map(c => c.field)} strategy={horizontalListSortingStrategy}>
                <tr key="main-header-row">
                  {selectable && (
                    <th key="h-cell-selectable" className={`${styles.th} ${styles.checkCell}`}>
                      <input type="checkbox" onChange={toggleAll} checked={selectedRows.size === displayRows.filter(r => !r.__group).length && displayRows.length > 0} />
                    </th>
                  )}
                  {activeCols.map((col, idx) => (
                    <SortableHeaderCell
                      key={`h-cell-${col.field}-${idx}`}
                      col={{ ...col, width: colWidths[col.field] }}
                      sortField={sortField}
                      sortDir={sortDir}
                      onSortClick={sortable ? handleSort : () => {}}
                      onMenuOpen={(field, rect) => setActiveColMenu({ field, rect })}
                      onResizeStart={resizable ? handleResizeStart : () => {}}
                      filterValue={columnFilters[col.field] ?? ''}
                      onFilterChange={v => { setColumnFilters(prev => ({ ...prev, [col.field]: v })); setPage(1); }}
                      filterable={filterable}
                    />
                  ))}
                  {(onEdit || onDelete || onDetail || detailModal) && (
                    <th key="h-cell-actions" className={`${styles.th} ${styles.actionCol}`}></th>
                  )}
                </tr>
              </SortableContext>
            </thead>
            <tbody>
              {loading ? (
                <tr key="tr-loading-state">
                  <td key="td-loading" colSpan={activeCols.length + (selectable ? 2 : 1) + (onEdit || onDelete || onDetail ? 1 : 0)} className={styles.stateCell}>
                    <span className={styles.spinner} /> Yükleniyor...
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr key="tr-empty-state">
                  <td key="td-empty" colSpan={activeCols.length + (selectable ? 2 : 1) + (onEdit || onDelete || onDetail || detailModal ? 1 : 0)} className={styles.stateCell}>
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                displayRows.map((row: any, idx: number) => {
                  if (row.__group) {
                    return (
                      <tr key={`group-row-${row.groupKey}-${idx}`} className={styles.groupRow}
                        onClick={() => setCollapsedGroups(prev => {
                          const n = new Set(prev); n.has(row.groupKey) ? n.delete(row.groupKey) : n.add(row.groupKey); return n;
                        })}>
                        <td key={`group-cell-${idx}`} colSpan={activeCols.length + (selectable ? 2 : 1) + (onEdit || onDelete || onDetail ? 1 : 0)} style={{ paddingLeft: `${row.level * 20 + 14}px` }}>
                          {collapsedGroups.has(row.groupKey) ? <FaAngleRight /> : <FaAngleDown />}
                          <span className={styles.groupTitle}>{columns.find(c => c.field === row.field)?.title}: </span>
                          <strong>{row.value}</strong>
                          <span className={styles.groupCount}>({row.count})</span>
                        </td>
                      </tr>
                    );
                  }
                  
                  const rowId = row.id ?? `row-${idx}`;
                  const rowKey = `data-tr-${rowId}-${idx}`;
                  const isSelected = selectedRows.has(rowId);
                  
                  return (
                    <tr key={rowKey} className={`${styles.row} ${isSelected ? styles.selectedRow : ''}`}
                      onClick={() => onRowClick?.(row)}>
                      {selectable && (
                        <td 
                          key={`cell-select-${rowKey}`}
                          className={styles.checkCell} 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleRow(row); 
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            readOnly 
                            style={{ pointerEvents: 'none' }}
                          />
                        </td>
                      )}
                      {activeCols.map((col, cIdx) => (
                        <td key={`cell-${rowKey}-${col.field || cIdx}`} className={styles.td} style={{ width: colWidths[col.field] }}>
                          {col.template ? col.template(row) : (getNestedValue(row, col.field) ?? '-')}
                        </td>
                      ))}
                      {(onEdit || onDelete || onDetail || detailModal) && (
                        <td key={`cell-actions-${rowKey}`} className={`${styles.td} ${styles.actionCol}`} onClick={e => e.stopPropagation()}>
                          <button className={styles.rowDots} onClick={e => setRowMenuState({ row, rect: e.currentTarget.getBoundingClientRect() })}>
                            <FaEllipsisH />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </DndContext>
      </div>

      {/* ── Paginator ──────────────────────────────── */}
      {pageable && (
        <div className={styles.pager}>
          <span className={styles.pagerInfo}>
            {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)} / {totalCount} kayıt
          </span>
          <div className={styles.pagerControls}>
            <span>Sayfa başına:</span>
            <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}>
              {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button disabled={page <= 1} onClick={() => setPage(1)} className={styles.pgBtn}>«</button>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pgBtn}><FaChevronLeft /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button key={p} className={`${styles.pgBtn} ${p === page ? styles.pgActive : ''}`} onClick={() => setPage(p)}>{p}</button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={styles.pgBtn}><FaChevronRight /></button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className={styles.pgBtn}>»</button>
          </div>
        </div>
      )}

      {/* ── Portals ────────────────────────────────── */}

      {/* Column Header Menu */}
      {activeColMenu && createPortal(
        <div ref={colMenuRef} className={styles.popup}
          style={{ top: activeColMenu.rect.bottom + 4, left: activeColMenu.rect.left }}>
          <button onClick={() => { handleSort(activeColMenu.field); setActiveColMenu(null); }}>
            <FaSortUp /> Sırala (Artan)
          </button>
          <button onClick={() => { setSortField(activeColMenu.field); setSortDir('desc'); setActiveColMenu(null); }}>
            <FaSortDown /> Sırala (Azalan)
          </button>
          <div className={styles.popupSep} />
          <button onClick={() => {
            if (!groupedFields.includes(activeColMenu.field))
              setGroupedFields(prev => [...prev, activeColMenu.field]);
            setActiveColMenu(null);
          }}>
            <FaLayerGroup /> Bu Sütuna Göre Grupla
          </button>
        </div>, document.body
      )}

      {/* Column Chooser */}
      {colChooserRect && createPortal(
        <div ref={chooserRef} className={styles.popup}
          style={{ top: colChooserRect.bottom + 4, right: window.innerWidth - colChooserRect.right }}>
          <div className={styles.popupTitle}>Sütunlar</div>
          {columns.map(c => (
            <label key={c.field} className={styles.popupCheck}>
              <input type="checkbox" checked={visibleCols[c.field]}
                onChange={() => setVisibleCols(prev => ({ ...prev, [c.field]: !prev[c.field] }))} />
              {c.title}
            </label>
          ))}
        </div>, document.body
      )}

      {/* Row Action Menu */}
      {rowMenuState && createPortal(
        <div ref={rowMenuRef} className={styles.popup}
          style={{ top: rowMenuState.rect.bottom + 4, left: rowMenuState.rect.right - 175 }}>
          {(onDetail || detailModal) && (
            <button onClick={() => { 
              if (onDetail) onDetail(rowMenuState.row);
              setDetailRow(rowMenuState.row); 
              setRowMenuState(null); 
            }}>
              <FaEye /> Detayı Görüntüle
            </button>
          )}
          {onEdit && (
            <button onClick={() => { onEdit(rowMenuState.row); setRowMenuState(null); }}>
              <FaEdit /> Düzenle
            </button>
          )}
          {onDelete && (
            <>
              <div className={styles.popupSep} />
              <button className={styles.danger} onClick={() => { onDelete(rowMenuState.row); setRowMenuState(null); }}>
                <FaTrashAlt /> Sil
              </button>
            </>
          )}
        </div>, document.body
      )}

      {/* Detail Modal - Always available, falls back to built-in field viewer */}
      {detailRow && createPortal(
        <div className={styles.modalBg} onClick={() => setDetailRow(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <FaEye className={styles.modalIcon} />
              <h3>Kayıt Detayı</h3>
              <button className={styles.modalClose} onClick={() => setDetailRow(null)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              {detailModal
                ? detailModal(detailRow, () => setDetailRow(null))
                : (
                  <div className={styles.defaultForm}>
                    {columns.map(col => (
                      <div key={col.field} className={styles.formField}>
                        <label className={styles.formLabel}>{col.title}</label>
                        <input
                          className={styles.formInput}
                          defaultValue={String(getNestedValue(detailRow, col.field) ?? '')}
                          readOnly
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={() => setDetailRow(null)}>Kapat</button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
