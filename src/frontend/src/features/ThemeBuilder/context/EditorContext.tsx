import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { LayoutComponent, StorePage, StorePageSummary, ThemeConfig, Backlink, GlobalComponentsConfig, ThemeVersionSummary } from '../../../entities/StorePage/model/types';
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
  layout: LayoutComponent[];
  theme: ThemeConfig;
  backlinks: Backlink[];
  seo: SeoState;
  globalComponents: GlobalComponentsConfig;
  customCss: string;
  customJs: string;
  selectedComponentId: string | null;
  viewport: Viewport;
  leftTab: LeftTab;
  rightTab: RightTab;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  themeVersions: ThemeVersionSummary[];
  versionsLoading: boolean;
  // ── History (undo/redo) ───────────────────────────────
  _past: LayoutComponent[][];
  _future: LayoutComponent[][];
  _clipboard: LayoutComponent | null;
}

export type EditorAction =
  | { type: 'SET_PAGES'; pages: StorePageSummary[] }
  | { type: 'SET_ACTIVE_PAGE'; page: StorePage }
  | { type: 'SET_LAYOUT'; layout: LayoutComponent[] }
  | { type: 'SET_THEME'; theme: ThemeConfig }
  | { type: 'SET_BACKLINKS'; backlinks: Backlink[] }
  | { type: 'SET_SEO'; seo: SeoState }
  | { type: 'ADD_COMPONENT'; component: LayoutComponent }
  | { type: 'REMOVE_COMPONENT'; id: string }
  | { type: 'MOVE_COMPONENT'; id: string; direction: 'up' | 'down' }
  | { type: 'UPDATE_COMPONENT_PROPS'; id: string; props: Record<string, unknown> }
  | { type: 'SELECT_COMPONENT'; id: string | null }
  | { type: 'SET_VIEWPORT'; viewport: Viewport }
  | { type: 'SET_LEFT_TAB'; tab: LeftTab }
  | { type: 'SET_RIGHT_TAB'; tab: RightTab }
  | { type: 'SET_DIRTY'; dirty: boolean }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_GLOBAL_COMPONENTS'; globalComponents: GlobalComponentsConfig }
  | { type: 'SET_CUSTOM_CSS'; css: string }
  | { type: 'SET_CUSTOM_JS'; js: string }
  | { type: 'SET_THEME_VERSIONS'; versions: ThemeVersionSummary[] }
  | { type: 'SET_VERSIONS_LOADING'; loading: boolean }
  // ── History actions ───────────────────────────────────
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'DUPLICATE_COMPONENT'; id: string }
  | { type: 'COPY_COMPONENT'; id: string }
  | { type: 'PASTE_COMPONENT' };

const HISTORY_LIMIT = 50;

/** Mevcut layout'u geçmişe ekle, geleceği temizle */
function pushHistory(state: EditorState): EditorState {
  const past = [...state._past, state.layout];
  return {
    ...state,
    _past: past.length > HISTORY_LIMIT ? past.slice(-HISTORY_LIMIT) : past,
    _future: [],
  };
}

const initialState: EditorState = {
  pages: [],
  activePage: null,
  layout: [],
  theme: DEFAULT_THEME,
  backlinks: [],
  seo: { metaTitle: '', metaDescription: '', metaKeywords: '', openGraphImageUrl: '' },
  globalComponents: {
    navbar: { layout: 'classic', logoPosition: 'left', isSticky: true, showSearch: true, showLanguagePicker: true, customCss: '', customJs: '' },
    footer: { columnCount: 3, showSocials: true, showNewsletter: false, copyrightText: '', customCss: '', customJs: '' },
  },
  customCss: '',
  customJs: '',
  selectedComponentId: null,
  viewport: 'desktop',
  leftTab: 'pages',
  rightTab: 'props',
  isDirty: false,
  isSaving: false,
  isLoading: true,
  themeVersions: [],
  versionsLoading: false,
  _past: [],
  _future: [],
  _clipboard: null,
};

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {

    case 'SET_PAGES': return { ...state, pages: action.pages };

    case 'SET_ACTIVE_PAGE': {
      let layout: LayoutComponent[] = [];
      let backlinks: Backlink[] = [];
      const seo: SeoState = {
        metaTitle: action.page.metaTitle ?? '',
        metaDescription: action.page.metaDescription ?? '',
        metaKeywords: action.page.metaKeywords ?? '',
        openGraphImageUrl: action.page.openGraphImageUrl ?? '',
      };
      try { layout = action.page.layoutConfigJson ? JSON.parse(action.page.layoutConfigJson) as LayoutComponent[] : []; } catch { layout = []; }
      try { backlinks = action.page.backlinksJson ? JSON.parse(action.page.backlinksJson) as Backlink[] : []; } catch { backlinks = []; }
      // Sayfa değişince geçmişi sıfırla
      return { ...state, activePage: action.page, layout, backlinks, seo, selectedComponentId: null, isDirty: false, _past: [], _future: [] };
    }

    case 'SET_LAYOUT': {
      const h = pushHistory(state);
      return { ...h, layout: action.layout, isDirty: true };
    }

    case 'SET_THEME': return { ...state, theme: action.theme, isDirty: true };
    case 'SET_BACKLINKS': return { ...state, backlinks: action.backlinks, isDirty: true };
    case 'SET_SEO': return { ...state, seo: action.seo, isDirty: true };

    case 'ADD_COMPONENT': {
      const h = pushHistory(state);
      return { ...h, layout: [...state.layout, action.component], selectedComponentId: action.component.id, isDirty: true };
    }

    case 'REMOVE_COMPONENT': {
      const h = pushHistory(state);
      return {
        ...h,
        layout: state.layout.filter(c => c.id !== action.id),
        selectedComponentId: state.selectedComponentId === action.id ? null : state.selectedComponentId,
        isDirty: true,
      };
    }

    case 'MOVE_COMPONENT': {
      const idx = state.layout.findIndex(c => c.id === action.id);
      if (idx === -1) return state;
      const target = action.direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= state.layout.length) return state;
      const h = pushHistory(state);
      const newLayout = [...state.layout];
      [newLayout[idx], newLayout[target]] = [newLayout[target], newLayout[idx]];
      return { ...h, layout: newLayout, isDirty: true };
    }

    case 'UPDATE_COMPONENT_PROPS': {
      const h = pushHistory(state);
      return {
        ...h,
        layout: state.layout.map(c => c.id === action.id ? { ...c, props: { ...c.props, ...action.props } } : c),
        isDirty: true,
      };
    }

    case 'SELECT_COMPONENT':
      return { ...state, selectedComponentId: action.id, rightTab: action.id ? 'props' : state.rightTab };

    case 'SET_VIEWPORT': return { ...state, viewport: action.viewport };
    case 'SET_LEFT_TAB': return { ...state, leftTab: action.tab };
    case 'SET_RIGHT_TAB': return { ...state, rightTab: action.tab };
    case 'SET_DIRTY': return { ...state, isDirty: action.dirty };
    case 'SET_SAVING': return { ...state, isSaving: action.saving };
    case 'SET_LOADING': return { ...state, isLoading: action.loading };
    case 'SET_GLOBAL_COMPONENTS': return { ...state, globalComponents: action.globalComponents, isDirty: true };
    case 'SET_CUSTOM_CSS': return { ...state, customCss: action.css, isDirty: true };
    case 'SET_CUSTOM_JS': return { ...state, customJs: action.js, isDirty: true };
    case 'SET_THEME_VERSIONS': return { ...state, themeVersions: action.versions };
    case 'SET_VERSIONS_LOADING': return { ...state, versionsLoading: action.loading };

    // ── Undo ─────────────────────────────────────────────
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

    // ── Redo ─────────────────────────────────────────────
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

    // ── Duplicate ─────────────────────────────────────────
    case 'DUPLICATE_COMPONENT': {
      const idx = state.layout.findIndex(c => c.id === action.id);
      if (idx === -1) return state;
      const original = state.layout[idx];
      const clone: LayoutComponent = {
        ...original,
        id: crypto.randomUUID(),
        props: { ...original.props },
      };
      const h = pushHistory(state);
      const newLayout = [
        ...state.layout.slice(0, idx + 1),
        clone,
        ...state.layout.slice(idx + 1),
      ];
      return { ...h, layout: newLayout, selectedComponentId: clone.id, isDirty: true };
    }

    // ── Copy ─────────────────────────────────────────────
    case 'COPY_COMPONENT': {
      const comp = state.layout.find(c => c.id === action.id);
      if (!comp) return state;
      return { ...state, _clipboard: { ...comp, props: { ...comp.props } } };
    }

    // ── Paste ─────────────────────────────────────────────
    case 'PASTE_COMPONENT': {
      if (!state._clipboard) return state;
      const clone: LayoutComponent = {
        ...state._clipboard,
        id: crypto.randomUUID(),
        props: { ...state._clipboard.props },
      };
      const selIdx = state.selectedComponentId
        ? state.layout.findIndex(c => c.id === state.selectedComponentId)
        : -1;
      const insertAt = selIdx >= 0 ? selIdx + 1 : state.layout.length;
      const h = pushHistory(state);
      const newLayout = [
        ...state.layout.slice(0, insertAt),
        clone,
        ...state.layout.slice(insertAt),
      ];
      return { ...h, layout: newLayout, selectedComponentId: clone.id, isDirty: true };
    }

    default: return state;
  }
}

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
  return ctx;
}
