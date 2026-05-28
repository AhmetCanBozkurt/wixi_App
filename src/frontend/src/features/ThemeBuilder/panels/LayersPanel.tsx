import { useState } from 'react';
import {
  FaChevronRight,
  FaChevronDown,
  FaEye,
  FaHashtag,
  FaFont,
  FaImage,
  FaFile,
  FaBorderAll,
  FaCompass,
  FaGlobe
} from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { useWebBuilder } from '../../WebBuilder/hooks/useWebBuilder';
import { BLOCK_BY_TYPE } from '../blocks/blockRegistry';
import styles from './Panels.module.css';

interface TreeItem {
  id: string;
  type: 'page' | 'navbar' | 'footer' | 'row' | 'column' | 'component';
  label: string;
  icon: any;
  children?: TreeItem[];
  refId?: string; // used for selecting actual rows/columns/components
}

export function LayersPanel() {
  const { state, dispatch } = useEditor();
  const { layout, selectedComponentId, selectedRowId, selectedColumnId, activePage, pages } = state;
  const { loadPage } = useWebBuilder();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root-page', 'header-node', 'footer-node']));
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Helper to resolve icon based on type
  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('text') || t.includes('title') || t.includes('headline') || t.includes('paragraph') || t.includes('heading')) {
      return FaFont;
    }
    if (t.includes('image') || t.includes('logo') || t.includes('banner') || t.includes('video') || t.includes('media')) {
      return FaImage;
    }
    if (t.includes('row') || t.includes('column') || t.includes('container')) {
      return FaHashtag;
    }
    return FaBorderAll;
  };

  // Map nested components recursively
  const mapComponentToTree = (comp: any): TreeItem => {
    const def = BLOCK_BY_TYPE[comp.type];
    return {
      id: comp.id,
      type: 'component',
      label: def?.name || comp.type,
      icon: getIcon(comp.type),
      refId: comp.id,
      children: comp.children ? comp.children.map((child: any) => mapComponentToTree(child)) : []
    };
  };

  // Build the unified tree hierarchy
  const buildTree = (): TreeItem[] => {
    const pageChildren: TreeItem[] = [];

    // 1. Header (Navbar)
    pageChildren.push({
      id: 'navbar-root',
      type: 'navbar',
      label: 'Header',
      icon: FaHashtag,
      children: [
        {
          id: 'navbar-inner',
          type: 'component',
          label: 'NavBar',
          icon: FaCompass
        }
      ]
    });

    // 2. Rows and Components
    layout.forEach((row, rowIdx) => {
      const rowChildren: TreeItem[] = [];

      row.columns.forEach((col, colIdx) => {
        const colChildren: TreeItem[] = [];
        if (col.component) {
          colChildren.push(mapComponentToTree(col.component));
        }

        rowChildren.push({
          id: col.id,
          type: 'column',
          label: `Kolon ${colIdx + 1} (${col.span}/12)`,
          icon: FaHashtag,
          refId: col.id,
          children: colChildren
        });
      });

      pageChildren.push({
        id: row.id,
        type: 'row',
        label: `Satır ${rowIdx + 1}`,
        icon: FaHashtag,
        refId: row.id,
        children: rowChildren
      });
    });

    // 3. Footer
    pageChildren.push({
      id: 'footer-root',
      type: 'footer',
      label: 'Footer',
      icon: FaHashtag,
      children: [
        {
          id: 'footer-inner',
          type: 'component',
          label: 'Footer',
          icon: FaBorderAll
        }
      ]
    });

    return [
      {
        id: 'root-page',
        type: 'page',
        label: activePage?.title || 'Ana Sayfa',
        icon: FaFile,
        children: pageChildren
      }
    ];
  };

  // Filter tree based on search query
  const filterTree = (nodes: TreeItem[]): TreeItem[] => {
    return nodes
      .map(node => {
        const childrenFiltered = node.children ? filterTree(node.children) : [];
        const matches = node.label.toLowerCase().includes(searchQuery.toLowerCase());
        if (matches || childrenFiltered.length > 0) {
          return { ...node, children: childrenFiltered };
        }
        return null;
      })
      .filter(Boolean) as TreeItem[];
  };

  const fullTree = buildTree();
  const filteredTree = searchQuery ? filterTree(fullTree) : fullTree;

  // Click handler to select node
  const handleNodeClick = (node: TreeItem) => {
    if (node.type === 'page') {
      dispatch({ type: 'SELECT_COMPONENT', id: null });
      dispatch({ type: 'SELECT_ROW', rowId: null });
      dispatch({ type: 'SELECT_COLUMN', rowId: null, columnId: null });
    } else if (node.type === 'navbar' || node.id === 'navbar-inner') {
      dispatch({ type: 'SELECT_COMPONENT', id: null });
      dispatch({ type: 'SELECT_ROW', rowId: null });
      dispatch({ type: 'SET_LEFT_TAB', tab: 'global' });
    } else if (node.type === 'footer' || node.id === 'footer-inner') {
      dispatch({ type: 'SELECT_COMPONENT', id: null });
      dispatch({ type: 'SELECT_ROW', rowId: null });
      dispatch({ type: 'SET_LEFT_TAB', tab: 'global' });
    } else if (node.type === 'row' && node.refId) {
      dispatch({ type: 'SELECT_COMPONENT', id: null });
      dispatch({ type: 'SELECT_COLUMN', rowId: null, columnId: null });
      dispatch({ type: 'SELECT_ROW', rowId: node.refId });
      dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
    } else if (node.type === 'column' && node.refId) {
      // Find parent row
      const parentRow = layout.find(r => r.columns.some(c => c.id === node.refId));
      if (parentRow) {
        dispatch({ type: 'SELECT_ROW', rowId: parentRow.id });
        dispatch({ type: 'SELECT_COLUMN', rowId: parentRow.id, columnId: node.refId });
        dispatch({ type: 'SELECT_COMPONENT', id: null });
        dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
      }
    } else if (node.type === 'component' && node.refId) {
      dispatch({ type: 'SELECT_COMPONENT', id: node.refId });
      dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
    }
  };

  // Render nodes recursively
  const renderNode = (node: TreeItem, level: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isHidden = hiddenNodes.has(node.id);

    // Determine active state
    let isActive = false;
    if (node.type === 'page' && !selectedComponentId && !selectedRowId) isActive = true;
    else if (node.type === 'row' && selectedRowId === node.refId && !selectedComponentId && !selectedColumnId) isActive = true;
    else if (node.type === 'column' && selectedColumnId === node.refId && !selectedComponentId) isActive = true;
    else if (node.type === 'component' && selectedComponentId === node.refId) isActive = true;

    const NodeIcon = node.icon;

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div
          className={`${styles.layerChildRow} ${isActive ? styles.layerChildRowActive : ''}`}
          style={{
            paddingLeft: `${level * 12 + 8}px`,
            display: 'flex',
            alignItems: 'center',
            height: '28px',
            cursor: 'pointer',
            opacity: isHidden ? 0.4 : 1
          }}
          onClick={() => handleNodeClick(node)}
        >
          {/* Collapse/Expand Chevron */}
          <div style={{ width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasChildren && (
              <span onClick={(e) => toggleExpand(node.id, e)} style={{ display: 'flex', alignItems: 'center' }}>
                {isExpanded ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
              </span>
            )}
          </div>

          {/* Node Icon */}
          <span style={{ marginRight: '6px', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
            <NodeIcon size={11} />
          </span>

          {/* Label */}
          <span style={{ flex: 1, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.label}
          </span>

          {/* Badges & Actions */}
          {node.type === 'page' && (
            <span style={{ fontSize: '8px', padding: '1px 4px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', marginRight: '6px', color: 'var(--editor-text-muted)', textTransform: 'uppercase' }}>
              PAGE
            </span>
          )}

          {/* Visibility toggle (Eye icon) */}
          <span
            onClick={(e) => toggleVisibility(node.id, e)}
            style={{
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              opacity: isHidden ? 0.8 : 0.2,
              transition: 'opacity 0.15s'
            }}
            className={styles.visibilityToggle}
          >
            <FaEye size={10} />
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const otherPages = pages.filter(p => p.slug !== activePage?.slug);

  return (
    <div className={styles.leftContent} style={{ background: 'var(--editor-bg)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Search Input */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--editor-border)', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className={styles.input}
            style={{ paddingLeft: '28px', height: '28px', fontSize: '11px' }}
            placeholder="Katmanları ara... (Ctrl+F)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '10px' }}>🔍</span>
        </div>
      </div>

      {/* Layer Tree Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {filteredTree.map(node => renderNode(node, 0))}
      </div>

      {/* Site Pages Quick Switcher */}
      {otherPages.length > 0 && (
        <div style={{ borderTop: '1px solid var(--editor-border)', padding: '12px 12px 8px', flexShrink: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--editor-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Site Sayfaları (SİTE PAGES)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {otherPages.map(p => (
              <div
                key={p.id}
                onClick={() => void loadPage(p.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  transition: 'background 0.15s'
                }}
                className={styles.layerChildRow}
              >
                <FaFile size={10} style={{ opacity: 0.5 }} />
                <span style={{ flex: 1 }}>{p.title}</span>
                {p.slug === 'blog' && (
                  <span style={{ fontSize: '8px', padding: '1px 4px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600 }}>
                    CMS
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
