import { heroBlock } from '../Hero/Hero.schema';
import { heroSplitBlock } from '../HeroSplit/HeroSplit.schema';
import { textImageBlock } from '../TextImage/TextImage.schema';
import { richTextBlock } from '../RichText/RichText.schema';
import { statsBarBlock } from '../StatsBar/StatsBar.schema';
import { videoEmbedBlock } from '../VideoEmbed/VideoEmbed.schema';
import { featuredProductsBlock } from '../FeaturedProducts/FeaturedProducts.schema';
import { categoriesGridBlock } from '../CategoriesGrid/CategoriesGrid.schema';
import { brandLogosBlock } from '../BrandLogos/BrandLogos.schema';
import { newsletterBlock } from '../Newsletter/Newsletter.schema';
import { testimonialsBlock } from '../Testimonials/Testimonials.schema';
import { countdownBlock } from '../Countdown/Countdown.schema';
import { promoBannerBlock } from '../PromoBanner/PromoBanner.schema';
import { sliderBlock } from '../Slider/Slider.schema';
import { faqBlock } from '../Faq/Faq.schema';
import { contactFormBlock } from '../ContactForm/ContactForm.schema';
import { customHtmlBlock } from '../CustomHtml/CustomHtml.schema';
import { heroCorporateBlock } from '../HeroCorporate/HeroCorporate.schema';
import { aboutCompanyBlock } from '../AboutCompany/AboutCompany.schema';
import { teamGridBlock } from '../TeamGrid/TeamGrid.schema';
import { servicesGridBlock } from '../ServicesGrid/ServicesGrid.schema';
import { featuresHighlightBlock } from '../FeaturesHighlight/FeaturesHighlight.schema';
import { processStepsBlock } from '../ProcessSteps/ProcessSteps.schema';
import { pricingPlansBlock } from '../PricingPlans/PricingPlans.schema';
import { clientsLogosBlock } from '../ClientsLogos/ClientsLogos.schema';
import { awardsCertificationsBlock } from '../AwardsCertifications/AwardsCertifications.schema';
import { numbersCounterBlock } from '../NumbersCounter/NumbersCounter.schema';
import { ctaBannerBlock } from '../CtaBanner/CtaBanner.schema';
import { contactDetailsBlock } from '../ContactDetails/ContactDetails.schema';
import { blogListBlock } from '../BlogList/BlogList.schema';
import { timelineBlock } from '../Timeline/Timeline.schema';
import { portfolioGridBlock } from '../PortfolioGrid/PortfolioGrid.schema';
import { mapEmbedBlock } from '../MapEmbed/MapEmbed.schema';
import { phoneContactBlock } from '../PhoneContact/PhoneContact.schema';
import { sectionContainerBlock } from '../SectionContainer/SectionContainer.schema';
import { gridRowBlock } from '../GridRow/GridRow.schema';
import { gridColumnBlock } from '../GridColumn/GridColumn.schema';
import type { BlockDefinition } from './types';

export const BLOCK_REGISTRY: BlockDefinition[] = [
  heroBlock,
  heroSplitBlock,
  textImageBlock,
  richTextBlock,
  statsBarBlock,
  videoEmbedBlock,
  featuredProductsBlock,
  categoriesGridBlock,
  brandLogosBlock,
  newsletterBlock,
  testimonialsBlock,
  countdownBlock,
  promoBannerBlock,
  sliderBlock,
  faqBlock,
  contactFormBlock,
  customHtmlBlock,
  heroCorporateBlock,
  aboutCompanyBlock,
  teamGridBlock,
  servicesGridBlock,
  featuresHighlightBlock,
  processStepsBlock,
  pricingPlansBlock,
  clientsLogosBlock,
  awardsCertificationsBlock,
  numbersCounterBlock,
  ctaBannerBlock,
  contactDetailsBlock,
  blogListBlock,
  timelineBlock,
  portfolioGridBlock,
  mapEmbedBlock,
  phoneContactBlock,
  sectionContainerBlock,
  gridRowBlock,
  gridColumnBlock,
];

export const BLOCK_BY_TYPE = Object.fromEntries(BLOCK_REGISTRY.map(b => [b.type, b]));

export const BLOCK_CATEGORIES = {
  hero:      'Hero',
  content:   'İçerik',
  commerce:  'E-Ticaret',
  marketing: 'Pazarlama',
  forms:     'Formlar',
  advanced:  'Gelişmiş',
  corporate: 'Kurumsal',
} as const;

export * from './types';
