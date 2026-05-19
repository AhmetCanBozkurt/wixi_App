export type StorePageType = 'Home' | 'About' | 'Contact' | 'Custom' | 'ProductListing' | 'ProductDetail';

export interface LayoutComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export interface Backlink {
  url: string;
  anchorText: string;
  noFollow: boolean;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  success: string;
  danger: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFont: string;
  baseFontSize: string;
  lineHeight: string;
  headingWeight: string;
}

export interface ThemeSpacing {
  containerMaxWidth: string;
  sectionPaddingY: string;
  sectionPaddingX: string;
}

export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  button: string;
  card: string;
}

export interface NavbarConfig {
  layout: 'classic' | 'centered' | 'mega';
  logoPosition: 'left' | 'center';
  isSticky: boolean;
  showSearch: boolean;
  showLanguagePicker: boolean;
  customCss?: string;
  customJs?: string;
}

export interface FooterConfig {
  columnCount: 1 | 2 | 3 | 4;
  showSocials: boolean;
  showNewsletter: boolean;
  copyrightText: string;
  customCss?: string;
  customJs?: string;
}

export interface GlobalComponentsConfig {
  navbar: NavbarConfig;
  footer: FooterConfig;
}

export interface ThemeVersionSummary {
  id: number;
  versionNumber: number;
  versionLabel: string | null;
  versionType: 'auto' | 'checkpoint' | 'rollback' | 'super_admin';
  isPublished: boolean;
  restoredFromVersionId: number | null;
  changedByEmail: string | null;
  createdAt: string;
}

export interface ThemeVersionDetail extends ThemeVersionSummary {
  themeConfigJson: string | null;
  globalComponentsConfigJson: string | null;
  customCssOverride: string | null;
  customJsOverride: string | null;
}

export interface ThemeShadows {
  card: string;
  button: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
}

export interface StorePageSummary {
  id: string;
  pageType: StorePageType;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface StorePage {
  id: string;
  pageType: StorePageType;
  slug: string;
  title: string;
  layoutConfigJson: string | null;
  themeOverrideJson: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  openGraphImageUrl: string | null;
  backlinksJson: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  socialLinksJson: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string | null;
  themeConfigJson: string | null;
  layoutConfigJson: string | null;
  supportedLanguages: string | null;
  defaultLanguage: string | null;
  globalComponentsConfigJson: string | null;
  customCssOverride: string | null;
  customJsOverride: string | null;
}
