/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type {
  LayoutComponent,
  LayoutRow,
  LayoutColumn,
  LayoutRowProps,
  StorePage,
  StorePageSummary,
  ThemeConfig,
  Backlink,
  GlobalComponentsConfig,
  ThemeVersionSummary,
} from '../../../entities/StorePage/model/types';
import { DEFAULT_THEME } from '../../../entities/StorePage/model/defaultTheme';

export type Viewport = 'desktop' | 'tablet' | 'mobile';
export type LeftTab = 'pages' | 'components' | 'layers' | 'theme' | 'global' | 'code';
export type RightTab = 'props' | 'seo' | 'backlinks';

export interface SeoState {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  openGraphImageUrl: string;
}

export interface EditorState {
  pages: StorePageSummary[];
  activePage: StorePage | null;
  layout: LayoutRow[];
  theme: ThemeConfig;
  backlinks: Backlink[];
  seo: SeoState;
  globalComponents: GlobalComponentsConfig;
  customCss: string;
  customJs: string;
  selectedComponentId: string | null;
  selectedRowId: string | null;
  selectedColumnId: string | null;
  selectedPropKey: string | null;
  viewport: Viewport;
  leftTab: LeftTab;
  rightTab: RightTab;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  themeVersions: ThemeVersionSummary[];
  versionsLoading: boolean;
  insertAtRowIndex: number | null;
  insertTargetRowId: string | null;
  _past: LayoutRow[][];
  _future: LayoutRow[][];
  _clipboard: LayoutComponent | null;
}

export type EditorAction =
  | { type: 'SET_PAGES'; pages: StorePageSummary[] }
  | { type: 'SET_ACTIVE_PAGE'; page: StorePage }
  | { type: 'SET_LAYOUT'; layout: LayoutRow[] }
  | { type: 'SET_THEME'; theme: ThemeConfig }
  | { type: 'SET_BACKLINKS'; backlinks: Backlink[] }
  | { type: 'SET_SEO'; seo: SeoState }
  | { type: 'SET_GLOBAL_COMPONENTS'; globalComponents: GlobalComponentsConfig }
  | { type: 'SET_CUSTOM_CSS'; css: string }
  | { type: 'SET_CUSTOM_JS'; js: string }
  | { type: 'SET_THEME_VERSIONS'; versions: ThemeVersionSummary[] }
  | { type: 'SET_VERSIONS_LOADING'; loading: boolean }
  | { type: 'SET_DIRTY'; dirty: boolean }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'SET_LOADING'; loading: boolean }
  // Component ekleme (ComponentsPanel değişmeden kalır)
  | { type: 'ADD_COMPONENT'; component: LayoutComponent }
  // Row actions
  | { type: 'REMOVE_ROW'; rowId: string }
  | { type: 'MOVE_ROW'; rowId: string; direction: 'up' | 'down' }
  | { type: 'UPDATE_ROW_PROPS'; rowId: string; props: Partial<LayoutRowProps> }
  | { type: 'REORDER_ROWS'; rows: LayoutRow[] }
  // Column actions
  | { type: 'ADD_COLUMN_TO_ROW'; rowId: string; component?: LayoutComponent }
  | { type: 'REMOVE_COLUMN'; rowId: string; columnId: string }
  | { type: 'UPDATE_COLUMN_SPAN'; rowId: string; columnId: string; span: number; siblingId?: string; siblingSpan?: number }
  | { type: 'REORDER_COLUMNS'; rowId: string; columns: LayoutColumn[] }
  // Component actions
  | { type: 'UPDATE_COMPONENT_PROPS'; componentId: string; props: Record<string, unknown> }
  | { type: 'REMOVE_COMPONENT'; componentId: string }
  | { type: 'DUPLICATE_COMPONENT'; componentId: string }
  | { type: 'COPY_COMPONENT'; componentId: string }
  | { type: 'PASTE_COMPONENT' }
  | { type: 'ADD_COMPONENT_TO_PARENT'; parentId: string; component: LayoutComponent }
  // Selection
  | { type: 'SELECT_COMPONENT'; id: string | null }
  | { type: 'SELECT_ROW'; rowId: string | null }
  | { type: 'SELECT_COLUMN'; rowId: string | null; columnId: string | null }
  | { type: 'SELECT_PROP'; propKey: string | null }
  // UI
  | { type: 'SET_VIEWPORT'; viewport: Viewport }
  | { type: 'SET_LEFT_TAB'; tab: LeftTab }
  | { type: 'SET_RIGHT_TAB'; tab: RightTab }
  | { type: 'SET_INSERT_ROW_INDEX'; index: number | null }
  | { type: 'SET_INSERT_TARGET_ROW'; rowId: string | null }
  // History
  | { type: 'UNDO' }
  | { type: 'REDO' };

const HISTORY_LIMIT = 50;

// ── Helpers (exported) ────────────────────────────────────────────────────────

export function findComponentInRows(layout: LayoutRow[], id: string): LayoutComponent | null {
  function findInComp(comp: LayoutComponent): LayoutComponent | null {
    if (comp.id === id) return comp;
    if (comp.children) {
      for (const child of comp.children) {
        const found = findInComp(child);
        if (found) return found;
      }
    }
    return null;
  }
  for (const row of layout) {
    for (const col of row.columns) {
      if (col.component) {
        const found = findInComp(col.component);
        if (found) return found;
      }
    }
  }
  return null;
}

export function findColumnInRows(
  layout: LayoutRow[],
  componentId: string,
): { row: LayoutRow; column: LayoutColumn } | null {
  for (const row of layout) {
    for (const col of row.columns) {
      if (col.component) {
        if (findComponentInRows([row], componentId)) return { row, column: col };
      }
    }
  }
  return null;
}

export function migrateLayout(data: unknown): LayoutRow[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  // Already LayoutRow[] format?
  if (data[0] && typeof data[0] === 'object' && 'columns' in (data[0] as object)) {
    return data as LayoutRow[];
  }
  // Old LayoutComponent[] — each becomes a row with a single span-12 column
  return (data as LayoutComponent[]).map(comp => ({
    id: crypto.randomUUID(),
    columns: [{ id: crypto.randomUUID(), span: 12, component: comp }],
    props: {},
  }));
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function evenSpans(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(12 / count);
  const rem = 12 % count;
  return Array.from({ length: count }, (_, i) => base + (i < rem ? 1 : 0));
}

function redistributeSpans(columns: LayoutColumn[]): LayoutColumn[] {
  if (columns.length === 0) return [];
  const spans = evenSpans(columns.length);
  return columns.map((col, i) => ({ ...col, span: spans[i] }));
}

function deepCloneComp(comp: LayoutComponent): LayoutComponent {
  return {
    ...comp,
    id: crypto.randomUUID(),
    props: { ...comp.props },
    children: comp.children ? comp.children.map(deepCloneComp) : undefined,
  };
}

function pushHistory(state: EditorState): EditorState {
  const past = [...state._past, state.layout];
  return {
    ...state,
    _past: past.length > HISTORY_LIMIT ? past.slice(-HISTORY_LIMIT) : past,
    _future: [],
  };
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: EditorState = {
  pages: [],
  activePage: null,
  layout: [],
  theme: DEFAULT_THEME,
  backlinks: [],
  seo: { metaTitle: '', metaDescription: '', metaKeywords: '', openGraphImageUrl: '' },
  globalComponents: {
    navbar: {
      layout: 'classic',
      logoPosition: 'left',
      isSticky: true,
      showSearch: true,
      showLanguagePicker: true,
      customCss: '',
      customJs: '',
      logoText: 'LOGO',
      logoUrl: '',
      links: [
        { label: 'Anasayfa', href: '/' },
        { label: 'Ürünler', href: '/products' },
        { label: 'Hakkında', href: '/about' }
      ]
    },
    footer: {
      columnCount: 3,
      showSocials: true,
      showNewsletter: false,
      copyrightText: '',
      customCss: '',
      customJs: '',
      columns: [
        { title: 'Kurumsal', links: [{ label: 'Hakkımızda', href: '/about' }, { label: 'İletişim', href: '/contact' }] },
        { title: 'Destek', links: [{ label: 'Yardım', href: '/help' }, { label: 'SSS', href: '/faq' }] },
        { title: 'Yasal', links: [{ label: 'Gizlilik', href: '/privacy' }, { label: 'Şartlar', href: '/terms' }] }
      ],
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'instagram', url: 'https://instagram.com' }
      ]
    },
  },
  customCss: '',
  customJs: '',
  selectedComponentId: null,
  selectedRowId: null,
  selectedColumnId: null,
  selectedPropKey: null,
  viewport: 'desktop',
  leftTab: 'pages',
  rightTab: 'props',
  isDirty: false,
  isSaving: false,
  isLoading: true,
  themeVersions: [],
  versionsLoading: false,
  insertAtRowIndex: null,
  insertTargetRowId: null,
  _past: [],
  _future: [],
  _clipboard: null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {

    case 'SET_PAGES': {
      const updated = state.activePage
        ? action.pages.find(p => p.id === state.activePage!.id)
        : undefined;
      const activePage = updated && state.activePage
        ? { ...state.activePage, isPublished: updated.isPublished }
        : state.activePage;
      return { ...state, pages: action.pages, activePage };
    }

    case 'SET_ACTIVE_PAGE': {
      let layout: LayoutRow[] = [];
      let backlinks: Backlink[] = [];
      const seo: SeoState = {
        metaTitle: action.page.metaTitle ?? '',
        metaDescription: action.page.metaDescription ?? '',
        metaKeywords: action.page.metaKeywords ?? '',
        openGraphImageUrl: action.page.openGraphImageUrl ?? '',
      };
      try {
        layout = action.page.layoutConfigJson
          ? migrateLayout(JSON.parse(action.page.layoutConfigJson))
          : [];
      } catch { layout = []; }
      try {
        backlinks = action.page.backlinksJson
          ? JSON.parse(action.page.backlinksJson) as Backlink[]
          : [];
      } catch { backlinks = []; }
      return {
        ...state,
        activePage: action.page,
        layout,
        backlinks,
        seo,
        selectedComponentId: null,
        selectedRowId: null,
        selectedColumnId: null,
        isDirty: false,
        _past: [],
        _future: [],
      };
    }

    case 'SET_LAYOUT': {
      const h = pushHistory(state);
      return { ...h, layout: action.layout, isDirty: true };
    }

    case 'SET_THEME': return { ...state, theme: action.theme, isDirty: true };
    case 'SET_BACKLINKS': return { ...state, backlinks: action.backlinks, isDirty: true };
    case 'SET_SEO': return { ...state, seo: action.seo, isDirty: true };
    case 'SET_GLOBAL_COMPONENTS': return { ...state, globalComponents: action.globalComponents, isDirty: true };
    case 'SET_CUSTOM_CSS': return { ...state, customCss: action.css, isDirty: true };
    case 'SET_CUSTOM_JS': return { ...state, customJs: action.js, isDirty: true };
    case 'SET_THEME_VERSIONS': return { ...state, themeVersions: action.versions };
    case 'SET_VERSIONS_LOADING': return { ...state, versionsLoading: action.loading };
    case 'SET_DIRTY': return { ...state, isDirty: action.dirty };
    case 'SET_SAVING': return { ...state, isSaving: action.saving };
    case 'SET_LOADING': return { ...state, isLoading: action.loading };

    case 'ADD_COMPONENT': {
      const h = pushHistory(state);

      if (state.selectedComponentId) {
        const selectedComp = findComponentInRows(h.layout, state.selectedComponentId);
        if (selectedComp && ['section-container', 'grid-row', 'grid-column'].includes(selectedComp.type)) {
          const addToComp = (comp: LayoutComponent): LayoutComponent => {
            if (comp.id === selectedComp.id) {
              const children = comp.children ? [...comp.children, action.component] : [action.component];
              return { ...comp, children };
            }
            if (comp.children) {
              return { ...comp, children: comp.children.map(addToComp) };
            }
            return comp;
          };
          const newLayout = h.layout.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              if (!col.component) return col;
              return { ...col, component: addToComp(col.component) };
            }),
          }));
          return {
            ...h,
            layout: newLayout,
            selectedComponentId: action.component.id,
            isDirty: true,
          };
        }
      }

      if (state.insertTargetRowId) {
        // Add as new column in existing row
        const newLayout = h.layout.map(row => {
          if (row.id !== state.insertTargetRowId) return row;
          const newCol: LayoutColumn = {
            id: crypto.randomUUID(),
            span: 1,
            component: action.component,
          };
          const updated = redistributeSpans([...row.columns, newCol]);
          return { ...row, columns: updated };
        });
        return {
          ...h,
          layout: newLayout,
          selectedComponentId: action.component.id,
          insertAtRowIndex: null,
          insertTargetRowId: null,
          isDirty: true,
        };
      }
      // Create a new row with a single span-12 column
      const insertAt = state.insertAtRowIndex !== null ? state.insertAtRowIndex : h.layout.length;
      const newRow: LayoutRow = {
        id: crypto.randomUUID(),
        columns: [{ id: crypto.randomUUID(), span: 12, component: action.component }],
        props: {},
      };
      const newLayout = [
        ...h.layout.slice(0, insertAt),
        newRow,
        ...h.layout.slice(insertAt),
      ];
      return {
        ...h,
        layout: newLayout,
        selectedComponentId: action.component.id,
        insertAtRowIndex: null,
        isDirty: true,
      };
    }

    case 'REMOVE_ROW': {
      const h = pushHistory(state);
      return {
        ...h,
        layout: state.layout.filter(r => r.id !== action.rowId),
        selectedRowId: state.selectedRowId === action.rowId ? null : state.selectedRowId,
        selectedColumnId: null,
        selectedComponentId: null,
        isDirty: true,
      };
    }

    case 'MOVE_ROW': {
      const idx = state.layout.findIndex(r => r.id === action.rowId);
      if (idx === -1) return state;
      const target = action.direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= state.layout.length) return state;
      const h = pushHistory(state);
      const newLayout = [...state.layout];
      [newLayout[idx], newLayout[target]] = [newLayout[target], newLayout[idx]];
      return { ...h, layout: newLayout, isDirty: true };
    }

    case 'UPDATE_ROW_PROPS': {
      const h = pushHistory(state);
      return {
        ...h,
        layout: state.layout.map(row =>
          row.id === action.rowId
            ? { ...row, props: { ...row.props, ...action.props } }
            : row
        ),
        isDirty: true,
      };
    }

    case 'REORDER_ROWS': {
      const h = pushHistory(state);
      return { ...h, layout: action.rows, isDirty: true };
    }

    case 'ADD_COLUMN_TO_ROW': {
      const h = pushHistory(state);
      const newLayout = h.layout.map(row => {
        if (row.id !== action.rowId) return row;
        const newCol: LayoutColumn = {
          id: crypto.randomUUID(),
          span: 1,
          component: action.component ?? null,
        };
        return { ...row, columns: redistributeSpans([...row.columns, newCol]) };
      });
      return {
        ...h,
        layout: newLayout,
        selectedComponentId: action.component?.id ?? state.selectedComponentId,
        isDirty: true,
      };
    }

    case 'REMOVE_COLUMN': {
      const h = pushHistory(state);
      const newLayout: LayoutRow[] = [];
      for (const row of h.layout) {
        if (row.id !== action.rowId) {
          newLayout.push(row);
          continue;
        }
        const remaining = row.columns.filter(c => c.id !== action.columnId);
        if (remaining.length === 0) {
          // Row becomes empty — drop it
          continue;
        }
        newLayout.push({ ...row, columns: redistributeSpans(remaining) });
      }
      return {
        ...h,
        layout: newLayout,
        selectedColumnId: state.selectedColumnId === action.columnId ? null : state.selectedColumnId,
        selectedComponentId: null,
        isDirty: true,
      };
    }

    case 'UPDATE_COLUMN_SPAN': {
      const h = pushHistory(state);
      const newLayout = h.layout.map(row => {
        if (row.id !== action.rowId) return row;
        return {
          ...row,
          columns: row.columns.map(col => {
            if (col.id === action.columnId) return { ...col, span: action.span };
            if (action.siblingId && col.id === action.siblingId && action.siblingSpan !== undefined) {
              return { ...col, span: action.siblingSpan };
            }
            return col;
          }),
        };
      });
      return { ...h, layout: newLayout, isDirty: true };
    }

    case 'REORDER_COLUMNS': {
      const h = pushHistory(state);
      const newLayout = h.layout.map(row =>
        row.id === action.rowId ? { ...row, columns: action.columns } : row
      );
      return { ...h, layout: newLayout, isDirty: true };
    }

    case 'UPDATE_COMPONENT_PROPS': {
      const h = pushHistory(state);
      const updateInComp = (comp: LayoutComponent): LayoutComponent => {
        if (comp.id === action.componentId) {
          return { ...comp, props: { ...comp.props, ...action.props } };
        }
        if (comp.children) {
          return { ...comp, children: comp.children.map(updateInComp) };
        }
        return comp;
      };
      const newLayout = h.layout.map(row => ({
        ...row,
        columns: row.columns.map(col => {
          if (!col.component) return col;
          return {
            ...col,
            component: updateInComp(col.component),
          };
        }),
      }));
      return { ...h, layout: newLayout, isDirty: true };
    }

    case 'REMOVE_COMPONENT': {
      const h = pushHistory(state);
      const removeFromComp = (comp: LayoutComponent): LayoutComponent | null => {
        if (comp.id === action.componentId) return null;
        if (comp.children) {
          const remaining = comp.children
            .map(removeFromComp)
            .filter((c): c is LayoutComponent => c !== null);
          return { ...comp, children: remaining };
        }
        return comp;
      };
      const newLayout: LayoutRow[] = [];
      for (const row of h.layout) {
        const hasTopLevel = row.columns.some(c => c.component?.id === action.componentId);
        if (hasTopLevel) {
          const remaining = row.columns.filter(c => c.component?.id !== action.componentId);
          if (remaining.length > 0) {
            newLayout.push({ ...row, columns: redistributeSpans(remaining) });
          }
        } else {
          const columns = row.columns.map(col => {
            if (!col.component) return col;
            return {
              ...col,
              component: removeFromComp(col.component),
            };
          });
          newLayout.push({ ...row, columns });
        }
      }
      return {
        ...h,
        layout: newLayout,
        selectedComponentId: state.selectedComponentId === action.componentId ? null : state.selectedComponentId,
        isDirty: true,
      };
    }

    case 'ADD_COMPONENT_TO_PARENT': {
      const h = pushHistory(state);
      const addToComp = (comp: LayoutComponent): LayoutComponent => {
        if (comp.id === action.parentId) {
          const children = comp.children ? [...comp.children, action.component] : [action.component];
          return { ...comp, children };
        }
        if (comp.children) {
          return { ...comp, children: comp.children.map(addToComp) };
        }
        return comp;
      };
      const newLayout = h.layout.map(row => ({
        ...row,
        columns: row.columns.map(col => {
          if (!col.component) return col;
          return { ...col, component: addToComp(col.component) };
        }),
      }));
      return {
        ...h,
        layout: newLayout,
        selectedComponentId: action.component.id,
        isDirty: true,
      };
    }

    case 'DUPLICATE_COMPONENT': {
      const location = findColumnInRows(state.layout, action.componentId);
      if (!location) return state;
      const h = pushHistory(state);
      const clone = deepCloneComp(location.column.component!);
      const cloneRow: LayoutRow = {
        id: crypto.randomUUID(),
        columns: [{ id: crypto.randomUUID(), span: 12, component: clone }],
        props: {},
      };
      const rowIdx = h.layout.findIndex(r => r.id === location.row.id);
      const newLayout = [
        ...h.layout.slice(0, rowIdx + 1),
        cloneRow,
        ...h.layout.slice(rowIdx + 1),
      ];
      return { ...h, layout: newLayout, selectedComponentId: clone.id, isDirty: true };
    }

    case 'COPY_COMPONENT': {
      const comp = findComponentInRows(state.layout, action.componentId);
      if (!comp) return state;
      return { ...state, _clipboard: { ...comp, props: { ...comp.props } } };
    }

    case 'PASTE_COMPONENT': {
      if (!state._clipboard) return state;
      const clone: LayoutComponent = {
        ...state._clipboard,
        id: crypto.randomUUID(),
        props: { ...state._clipboard.props },
      };
      const h = pushHistory(state);
      let insertIdx = h.layout.length;
      if (state.selectedComponentId) {
        const loc = findColumnInRows(h.layout, state.selectedComponentId);
        if (loc) {
          const rowIdx = h.layout.findIndex(r => r.id === loc.row.id);
          if (rowIdx !== -1) insertIdx = rowIdx + 1;
        }
      }
      const newRow: LayoutRow = {
        id: crypto.randomUUID(),
        columns: [{ id: crypto.randomUUID(), span: 12, component: clone }],
        props: {},
      };
      const newLayout = [
        ...h.layout.slice(0, insertIdx),
        newRow,
        ...h.layout.slice(insertIdx),
      ];
      return { ...h, layout: newLayout, selectedComponentId: clone.id, isDirty: true };
    }

    case 'SELECT_COMPONENT':
      return {
        ...state,
        selectedComponentId: action.id,
        selectedPropKey: null,
        rightTab: action.id ? 'props' : state.rightTab,
      };

    case 'SELECT_ROW':
      return { ...state, selectedRowId: action.rowId, selectedColumnId: null, selectedComponentId: null };

    case 'SELECT_COLUMN':
      return { ...state, selectedRowId: action.rowId, selectedColumnId: action.columnId };

    case 'SELECT_PROP':
      return { ...state, selectedPropKey: action.propKey };

    case 'SET_VIEWPORT': return { ...state, viewport: action.viewport };
    case 'SET_LEFT_TAB': return { ...state, leftTab: action.tab };
    case 'SET_RIGHT_TAB': return { ...state, rightTab: action.tab };

    case 'SET_INSERT_ROW_INDEX':
      return { ...state, insertAtRowIndex: action.index };

    case 'SET_INSERT_TARGET_ROW':
      return { ...state, insertTargetRowId: action.rowId };

    case 'UNDO': {
      if (state._past.length === 0) return state;
      const past = [...state._past];
      const prevLayout = past.pop()!;
      return {
        ...state,
        layout: prevLayout,
        _past: past,
        _future: [state.layout, ...state._future],
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state._future.length === 0) return state;
      const future = [...state._future];
      const nextLayout = future.shift()!;
      return {
        ...state,
        layout: nextLayout,
        _past: [...state._past, state.layout],
        _future: future,
        isDirty: true,
      };
    }

    default: return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface EditorContextValue {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return {
    ...ctx,
    selectProp: (propKey: string | null) => ctx.dispatch({ type: 'SELECT_PROP', propKey }),
    setInsertRowIndex: (index: number | null) => ctx.dispatch({ type: 'SET_INSERT_ROW_INDEX', index }),
    setInsertTargetRow: (rowId: string | null) => ctx.dispatch({ type: 'SET_INSERT_TARGET_ROW', rowId }),
  };
}
