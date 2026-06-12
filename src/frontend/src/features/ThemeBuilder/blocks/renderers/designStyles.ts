import type { CSSProperties } from 'react';

export const buildDesignStyles = (compProps: Record<string, any> | undefined): CSSProperties => {
  if (!compProps) return {};
  const s: CSSProperties = {};
  if (compProps.backgroundColor) s.backgroundColor = String(compProps.backgroundColor);
  if (compProps.textColor) s.color = String(compProps.textColor);

  // Padding
  if (compProps.paddingTop !== undefined && compProps.paddingTop !== '') s.paddingTop = String(compProps.paddingTop);
  if (compProps.paddingRight !== undefined && compProps.paddingRight !== '') s.paddingRight = String(compProps.paddingRight);
  if (compProps.paddingBottom !== undefined && compProps.paddingBottom !== '') s.paddingBottom = String(compProps.paddingBottom);
  if (compProps.paddingLeft !== undefined && compProps.paddingLeft !== '') s.paddingLeft = String(compProps.paddingLeft);

  // Margin
  if (compProps.marginTop !== undefined && compProps.marginTop !== '') s.marginTop = String(compProps.marginTop);
  if (compProps.marginRight !== undefined && compProps.marginRight !== '') s.marginRight = String(compProps.marginRight);
  if (compProps.marginBottom !== undefined && compProps.marginBottom !== '') s.marginBottom = String(compProps.marginBottom);
  if (compProps.marginLeft !== undefined && compProps.marginLeft !== '') s.marginLeft = String(compProps.marginLeft);

  // Border
  if (compProps.borderStyle && compProps.borderStyle !== 'none') s.borderStyle = compProps.borderStyle as any;
  if (compProps.borderWidth !== undefined && compProps.borderWidth !== '') s.borderWidth = String(compProps.borderWidth);
  if (compProps.borderColor) s.borderColor = String(compProps.borderColor);
  if (compProps.borderRadius !== undefined && compProps.borderRadius !== '') s.borderRadius = String(compProps.borderRadius);

  // Shadow
  if (compProps.boxShadow && compProps.boxShadow !== 'none') s.boxShadow = String(compProps.boxShadow);

  return s;
};
