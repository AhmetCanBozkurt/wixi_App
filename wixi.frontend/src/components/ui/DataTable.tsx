import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../../contexts/language-context";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  ChevronUp, 
  ChevronDown, 
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Columns3,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Checkbox } from "./checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
type ColumnFilterMode = "text" | "list";
export type ColumnFilterValue = string | string[];

export type ColumnDef<T> = {
  id: string;
  header: string;
  headerKey?: string;
  accessorKey: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  filterType?: ColumnFilterMode;
  filterPlaceholder?: string;
  filterOptions?: { label: string; value: string }[];
  getFilterValue?: (value: any, row: T) => string;
  translations?: Record<string, string>;
};

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (rows: T[]) => void;
  onExport?: (rows: T[]) => void;
  searchPlaceholder?: string;
  pageSize?: number;
  tableKey?: string;
  initialPreferences?: TablePreferenceState;
  onPreferencesChange?: (state: TablePreferenceState) => void;
  loading?: boolean;
  className?: string;
};

export type SortConfig = {
  key: string;
  direction: "asc" | "desc" | null;
};

export type TablePreferenceState = {
  tableKey?: string;
  visibleColumns: string[];
  columnOrder: string[];
  columnFilters: Record<string, ColumnFilterValue>;
  sortConfig: SortConfig;
  pageSize: number;
};

function SortableHeader({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="group relative bg-muted/50 border-r border-border text-[11px]"
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          className="cursor-grab active:cursor-grabbing hover:opacity-70 rounded p-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </th>
  );
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns: initialColumns,
  onEdit,
  onDelete,
  onExport,
  searchPlaceholder = "Search...",
  pageSize: initialPageSize = 10,
  tableKey,
  initialPreferences,
  onPreferencesChange,
  loading = false,
  className,
}: DataTableProps<T>) {
  const containerClassName = ["w-full", className].filter(Boolean).join(" ");
  const { language, t } = useLanguage();
  const [columns, setColumns] = useState(initialColumns);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.map((col) => col.id))
  );
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({});
  const [columnFilterSearch, setColumnFilterSearch] = useState<Record<string, string>>({});
  const preferencesAppliedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setColumns(initialColumns);
    setVisibleColumns(new Set(initialColumns.map((col) => col.id)));
    if (initialPreferences) {
      preferencesAppliedRef.current = false;
    }
  }, [initialColumns, initialPreferences]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const applyColumnOrder = useCallback((order?: string[]) => {
    if (!order || order.length === 0) return;
    setColumns((prev) => {
      const columnMap = new Map(prev.map((col) => [col.id, col]));
      const ordered: ColumnDef<T>[] = [];
      order.forEach((id) => {
        const column = columnMap.get(id);
        if (column) {
          ordered.push(column);
          columnMap.delete(id);
        }
      });
      return [...ordered, ...columnMap.values()];
    });
  }, []);

  useEffect(() => {
    if (preferencesAppliedRef.current) return;

    if (!initialPreferences) {
      preferencesAppliedRef.current = true;
      return;
    }

    applyColumnOrder(initialPreferences.columnOrder);

    if (initialPreferences.visibleColumns?.length) {
      setVisibleColumns(new Set(initialPreferences.visibleColumns));
    }

    if (initialPreferences.columnFilters) {
      setColumnFilters(initialPreferences.columnFilters);
    }

    if (initialPreferences.sortConfig) {
      setSortConfig({
        key: initialPreferences.sortConfig.key ?? "",
        direction: initialPreferences.sortConfig.direction ?? null,
      });
    }

    if (initialPreferences.pageSize && initialPreferences.pageSize > 0) {
      setPageSize(initialPreferences.pageSize);
    }

    preferencesAppliedRef.current = true;
  }, [initialPreferences, applyColumnOrder]);

  const getColumnHeader = useCallback((column: ColumnDef<T>) => {
    if (column.headerKey) {
      const translated = t(column.headerKey);
      if (translated && translated !== column.headerKey) {
        return translated;
      }
    }
    if (column.translations && column.translations[language]) {
      return column.translations[language];
    }
    return column.header;
  }, [language, t]);

  const visibleColumnDefs = useMemo(
    () => columns.filter((col) => visibleColumns.has(col.id)),
    [columns, visibleColumns]
  );

  const getFilterValue = (row: T, column: ColumnDef<T>): string => {
    const cellValue = row[column.accessorKey];
    if (column.getFilterValue) {
      return column.getFilterValue(cellValue, row);
    }
    return String(cellValue ?? "").trim();
  };

  const uniqueColumnValues = useMemo(() => {
    const map: Record<string, { label: string; value: string }[]> = {};
    columns.forEach((column) => {
      if (column.filterType === "list") {
        if (column.filterOptions?.length) {
          map[column.id] = column.filterOptions;
        } else {
          const values = Array.from(
            new Set(
              data
                .map((row) => getFilterValue(row, column))
                .filter((value) => value !== "")
            )
          )
            .sort((a, b) => a.localeCompare(b, "tr"))
            .map((value) => ({ label: value, value }));
          map[column.id] = values;
        }
      }
    });
    return map;
  }, [columns, data]);

  const cloneColumnFilters = () => {
    return Object.entries(columnFilters).reduce<Record<string, ColumnFilterValue>>((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? [...value] : value;
      return acc;
    }, {});
  };

  const getPreferenceSnapshot = useCallback((): TablePreferenceState => ({
    tableKey,
    visibleColumns: Array.from(visibleColumns),
    columnOrder: columns.map((col) => col.id),
    columnFilters: cloneColumnFilters(),
    sortConfig,
    pageSize,
  }), [tableKey, visibleColumns, columns, columnFilters, sortConfig, pageSize]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch = !searchQuery
        ? true
        : columns.some((col) => {
            const value = getFilterValue(row, col).toLowerCase();
            return value.includes(searchQuery.toLowerCase());
          });

      const matchesColumnFilters = Object.entries(columnFilters).every(([columnId, filterValue]) => {
        if (
          filterValue === undefined ||
          (typeof filterValue === "string" && filterValue === "") ||
          (Array.isArray(filterValue) && filterValue.length === 0)
        ) {
          return true;
        }
        const column = columns.find((c) => c.id === columnId);
        if (!column) return true;
        const cellValue = getFilterValue(row, column);
        if (Array.isArray(filterValue)) {
          return filterValue.includes(cellValue);
        }
        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });

      return matchesSearch && matchesColumnFilters;
    });
  }, [data, searchQuery, columns, columnFilters]);

  useEffect(() => {
    if (!onPreferencesChange || !preferencesAppliedRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onPreferencesChange(getPreferenceSnapshot());
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [onPreferencesChange, getPreferenceSnapshot]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === bValue) return 0;
      
      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((row) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId: string | number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    const rowsToDelete = data.filter((row) => selectedRows.has(row.id));
    onDelete?.(rowsToDelete);
    setSelectedRows(new Set());
  };

  const handleBulkExport = () => {
    const rowsToExport = data.filter((row) => selectedRows.has(row.id));
    onExport?.(rowsToExport);
  };

  const toggleColumnVisibility = (columnId: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnId)) {
      if (newVisible.size > 1) {
        newVisible.delete(columnId);
      }
    } else {
      newVisible.add(columnId);
    }
    setVisibleColumns(newVisible);
  };

  const handleTextFilterChange = (columnId: string, value: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next[columnId] = value;
      } else {
        delete next[columnId];
      }
      return next;
    });
    setCurrentPage(1);
  };

  const toggleListFilterValue = (columnId: string, optionValue: string, checked: boolean) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      const current = Array.isArray(prev[columnId]) ? (prev[columnId] as string[]) : [];
      const updated = checked
        ? Array.from(new Set([...current, optionValue]))
        : current.filter((value) => value !== optionValue);

      if (updated.length > 0) {
        next[columnId] = updated;
      } else {
        delete next[columnId];
      }
      return next;
    });
    setCurrentPage(1);
  };

  const clearColumnFilter = (columnId: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[columnId];
      return next;
    });
    setColumnFilterSearch((prev) => {
      const next = { ...prev };
      delete next[columnId];
      return next;
    });
    setCurrentPage(1);
  };

  const selectAllValues = (columnId: string) => {
    const values = (uniqueColumnValues[columnId] || []).map((option) => option.value);
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: values,
    }));
  };

  const setSortDirection = (columnId: string, direction: "asc" | "desc") => {
    setSortConfig({ key: columnId, direction });
  };

  const clearSort = (columnId: string) => {
    if (sortConfig.key === columnId) {
      setSortConfig({ key: "", direction: null });
    }
  };

  return (
    <div className={containerClassName}>
      <div className="border-2 border-border rounded-lg bg-card overflow-hidden">
        <div className="dt-toolbar flex flex-wrap gap-2.5 items-center justify-between px-2 py-1.5 border-b bg-muted/30 text-[13px]">
          <div className="flex items-center gap-2.5">
            {selectedRows.size > 0 && (
              <>
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-7 text-xs"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                {onExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkExport}
                    className="h-7 text-xs"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Columns3 className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={visibleColumns.has(column.id)}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                    disabled={visibleColumns.has(column.id) && visibleColumns.size === 1}
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1 min-w-[220px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-8 text-sm bg-background"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b-2 border-border text-[11px]">
                  <th className="w-12 px-2 py-1.5 bg-muted/50 border-r border-border">
                    <Checkbox
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((row) => selectedRows.has(row.id))
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <SortableContext
                    items={visibleColumnDefs.map((col) => col.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {visibleColumnDefs.map((column) => (
                      <SortableHeader key={column.id} id={column.id}>
                        <div className="flex items-center justify-between gap-2 border-r border-border pr-1">
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            {getColumnHeader(column)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 ${
                                  columnFilters[column.id] || sortConfig.key === column.id
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 space-y-2">
                              <DropdownMenuLabel>{column.header}</DropdownMenuLabel>
                              {column.sortable !== false && (
                                <>
                                  <DropdownMenuItem onClick={() => setSortDirection(column.id, "asc")}>
                                    <ChevronUp className="mr-2 h-4 w-4" />
                                    Artan sıralama
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setSortDirection(column.id, "desc")}>
                                    <ChevronDown className="mr-2 h-4 w-4" />
                                    Azalan sıralama
                                  </DropdownMenuItem>
                                  {sortConfig.key === column.id && (
                                    <DropdownMenuItem onClick={() => clearSort(column.id)}>
                                      <X className="mr-2 h-4 w-4" />
                                      Sıralamayı temizle
                                    </DropdownMenuItem>
                                  )}
                                  {column.filterType && <DropdownMenuSeparator />}
                                </>
                              )}
                              {column.filterType === "text" && (
                                <div className="space-y-2">
                                  <Input
                                    value={
                                      typeof columnFilters[column.id] === "string"
                                        ? (columnFilters[column.id] as string)
                                        : ""
                                    }
                                    placeholder={column.filterPlaceholder || "Değer girin"}
                                    onChange={(e) =>
                                      handleTextFilterChange(column.id, e.target.value)
                                    }
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => clearColumnFilter(column.id)}
                                    >
                                      Temizle
                                    </Button>
                                  </div>
                                </div>
                              )}
                              {column.filterType === "list" && (
                                <div className="space-y-2">
                                  <Input
                                    placeholder="Değerlerde ara..."
                                    value={columnFilterSearch[column.id] ?? ""}
                                    onChange={(e) =>
                                      setColumnFilterSearch((prev) => ({
                                        ...prev,
                                        [column.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <div className="max-h-48 overflow-auto space-y-1 pr-1">
                                    {(uniqueColumnValues[column.id] || [])
                                      .filter((option) =>
                                        (columnFilterSearch[column.id] ?? "")
                                          ? option.label
                                              .toLowerCase()
                                              .includes(
                                                (columnFilterSearch[column.id] ?? "")
                                                  .toLowerCase()
                                              )
                                          : true
                                      )
                                      .map((option) => {
                                        const selectedValues = Array.isArray(
                                          columnFilters[column.id]
                                        )
                                          ? (columnFilters[column.id] as string[])
                                          : [];
                                        return (
                                          <label
                                            key={option.value}
                                            className="flex items-center gap-2 text-sm"
                                          >
                                            <Checkbox
                                              checked={selectedValues.includes(option.value)}
                                              onCheckedChange={(checked) =>
                                                toggleListFilterValue(
                                                  column.id,
                                                  option.value,
                                                  Boolean(checked)
                                                )
                                              }
                                            />
                                            <span>{option.label || "Boş"}</span>
                                          </label>
                                        );
                                      })}
                                    {(uniqueColumnValues[column.id] || []).length === 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        Kayıt bulunamadı
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between pt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => selectAllValues(column.id)}
                                    >
                                      Tümünü seç
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => clearColumnFilter(column.id)}
                                    >
                                      Temizle
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </SortableHeader>
                    ))}
                  </SortableContext>
                  <th className="w-12 px-2 py-1.5 bg-muted/50"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumnDefs.length + 2} className="px-3 py-12 text-center border-r border-border text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-12 w-12 text-muted-foreground" />
                        <p className="text-base font-medium">No results found</p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-2 py-1.5 border-r border-border">
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row.id, checked as boolean)
                          }
                        />
                      </td>
                      {visibleColumnDefs.map((column, colIndex) => (
                        <td
                          key={column.id}
                          className="px-2 py-1.5 text-[12px] leading-snug border-r border-border"
                          style={{ width: column.width }}
                        >
                          {column.cell
                            ? column.cell(row[column.accessorKey], row)
                            : String(row[column.accessorKey] ?? "")}
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(row)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete([row])}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </DndContext>
        </div>

        <div className="dt-footer flex items-center justify-between px-3 py-2 border-t bg-muted/30 text-sm">
          <div className="text-muted-foreground">
            Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}{" "}
            results
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

