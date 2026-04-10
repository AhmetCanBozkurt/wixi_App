export interface SortConfigDto {
  key?: string | null;
  direction?: 'asc' | 'desc' | null;
}

export interface TablePreferenceDto {
  tableKey: string;
  visibleColumns?: string[];
  columnOrder?: string[];
  columnFilters?: Record<string, any>;
  sortConfig?: SortConfigDto | null;
  pageSize?: number;
}

export type UpdateTablePreferenceDto = TablePreferenceDto;

