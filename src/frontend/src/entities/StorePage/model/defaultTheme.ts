import type { ThemeConfig } from './types';

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#ec4899',
    primaryHover: '#db2777',
    secondary: '#a855f7',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#f59e0b',
    success: '#10b981',
    danger: '#ef4444',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Inter, sans-serif',
    baseFontSize: '16px',
    lineHeight: '1.6',
    headingWeight: '700',
  },
  spacing: {
    containerMaxWidth: '1200px',
    sectionPaddingY: '80px',
    sectionPaddingX: '24px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    button: '8px',
    card: '12px',
  },
  shadows: {
    card: '0 1px 3px rgba(0,0,0,0.1)',
    button: 'none',
  },
};

export function themeToVars(theme: ThemeConfig): Record<string, string> {
  return {
    '--sf-color-primary': theme.colors.primary,
    '--sf-color-primary-hover': theme.colors.primaryHover,
    '--sf-color-secondary': theme.colors.secondary,
    '--sf-color-bg': theme.colors.background,
    '--sf-color-surface': theme.colors.surface,
    '--sf-color-text': theme.colors.text,
    '--sf-color-text-muted': theme.colors.textMuted,
    '--sf-color-border': theme.colors.border,
    '--sf-color-accent': theme.colors.accent,
    '--sf-color-success': theme.colors.success,
    '--sf-color-danger': theme.colors.danger,
    '--sf-font-family': theme.typography.fontFamily,
    '--sf-heading-font': theme.typography.headingFont,
    '--sf-font-size': theme.typography.baseFontSize,
    '--sf-line-height': theme.typography.lineHeight,
    '--sf-heading-weight': theme.typography.headingWeight,
    '--sf-container-max': theme.spacing.containerMaxWidth,
    '--sf-section-py': theme.spacing.sectionPaddingY,
    '--sf-section-px': theme.spacing.sectionPaddingX,
    '--sf-radius-sm': theme.borderRadius.sm,
    '--sf-radius-md': theme.borderRadius.md,
    '--sf-radius-lg': theme.borderRadius.lg,
    '--sf-radius-btn': theme.borderRadius.button,
    '--sf-radius-card': theme.borderRadius.card,
    '--sf-shadow-card': theme.shadows.card,
    '--sf-shadow-btn': theme.shadows.button,
  };
}

export function mergeTheme(base: ThemeConfig, override: Partial<ThemeConfig>): ThemeConfig {
  return {
    colors: { ...base.colors, ...override.colors },
    typography: { ...base.typography, ...override.typography },
    spacing: { ...base.spacing, ...override.spacing },
    borderRadius: { ...base.borderRadius, ...override.borderRadius },
    shadows: { ...base.shadows, ...override.shadows },
  };
}
