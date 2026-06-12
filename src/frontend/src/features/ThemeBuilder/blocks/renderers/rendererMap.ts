import type { ComponentType } from 'react';
import type { BlockRendererProps } from './types';
import { HeroPreview } from '../Hero/Hero';
import { HeroSplitPreview } from '../HeroSplit/HeroSplit';
import { FeaturedProductsPreview } from '../FeaturedProducts/FeaturedProducts';
import { CategoriesGridPreview } from '../CategoriesGrid/CategoriesGrid';
import { TextImagePreview } from '../TextImage/TextImage';
import { StatsBarPreview } from '../StatsBar/StatsBar';
import { TestimonialsPreview } from '../Testimonials/Testimonials';
import { CountdownPreview } from '../Countdown/Countdown';
import { PromoBannerPreview } from '../PromoBanner/PromoBanner';
import { NewsletterPreview } from '../Newsletter/Newsletter';
import { ContactFormPreview } from '../ContactForm/ContactForm';
import { BrandLogosPreview } from '../BrandLogos/BrandLogos';
import { VideoEmbedPreview } from '../VideoEmbed/VideoEmbed';
import { RichTextPreview } from '../RichText/RichText';
import { CustomHtmlPreview } from '../CustomHtml/CustomHtml';
import { HeroCorporatePreview } from '../HeroCorporate/HeroCorporate';
import { AboutCompanyPreview } from '../AboutCompany/AboutCompany';
import { TeamGridPreview } from '../TeamGrid/TeamGrid';
import { ServicesGridPreview } from '../ServicesGrid/ServicesGrid';
import { FeaturesHighlightPreview } from '../FeaturesHighlight/FeaturesHighlight';
import { ProcessStepsPreview } from '../ProcessSteps/ProcessSteps';
import { PricingPlansPreview } from '../PricingPlans/PricingPlans';
import { ClientsLogosPreview } from '../ClientsLogos/ClientsLogos';
import { AwardsCertificationsPreview } from '../AwardsCertifications/AwardsCertifications';
import { NumbersCounterPreview } from '../NumbersCounter/NumbersCounter';
import { CtaBannerPreview } from '../CtaBanner/CtaBanner';
import { ContactDetailsPreview } from '../ContactDetails/ContactDetails';
import { BlogListPreview } from '../BlogList/BlogList';
import { TimelinePreview } from '../Timeline/Timeline';
import { PortfolioGridPreview } from '../PortfolioGrid/PortfolioGrid';
import { MapEmbedPreview } from '../MapEmbed/MapEmbed';
import { PhoneContactPreview } from '../PhoneContact/PhoneContact';
import { SliderPreview } from '../Slider/Slider';
import { FaqPreview } from '../Faq/Faq';
import { SectionContainerPreview } from '../SectionContainer/SectionContainer';
import { GridRowPreview } from '../GridRow/GridRow';
import { GridColumnPreview } from '../GridColumn/GridColumn';

export const BLOCK_RENDERERS: Record<string, ComponentType<BlockRendererProps>> = {
  'hero': HeroPreview,
  'hero-split': HeroSplitPreview,
  'featured-products': FeaturedProductsPreview,
  'categories-grid': CategoriesGridPreview,
  'text-image': TextImagePreview,
  'stats-bar': StatsBarPreview,
  'testimonials': TestimonialsPreview,
  'countdown': CountdownPreview,
  'promo-banner': PromoBannerPreview,
  'newsletter': NewsletterPreview,
  'contact-form': ContactFormPreview,
  'brand-logos': BrandLogosPreview,
  'video-embed': VideoEmbedPreview,
  'rich-text': RichTextPreview,
  'custom-html': CustomHtmlPreview,
  'hero-corporate': HeroCorporatePreview,
  'about-company': AboutCompanyPreview,
  'team-grid': TeamGridPreview,
  'services-grid': ServicesGridPreview,
  'features-highlight': FeaturesHighlightPreview,
  'process-steps': ProcessStepsPreview,
  'pricing-plans': PricingPlansPreview,
  'clients-logos': ClientsLogosPreview,
  'awards-certifications': AwardsCertificationsPreview,
  'numbers-counter': NumbersCounterPreview,
  'cta-banner': CtaBannerPreview,
  'contact-details': ContactDetailsPreview,
  'blog-list': BlogListPreview,
  'timeline': TimelinePreview,
  'portfolio-grid': PortfolioGridPreview,
  'map-embed': MapEmbedPreview,
  'phone-contact': PhoneContactPreview,
  'slider': SliderPreview,
  'faq': FaqPreview,
  'section-container': SectionContainerPreview,
  'grid-row': GridRowPreview,
  'grid-column': GridColumnPreview,
};
