import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('landing-lng') ?? 'tr',
    fallbackLng: 'tr',
    resources: {
      tr: {
        landing: {
          LANDING_NAV_FEATURES: 'Özellikler',
          LANDING_NAV_PRICING: 'Fiyatlandırma',
          LANDING_NAV_HOW_IT_WORKS: 'Nasıl Çalışır?',
          LANDING_NAV_FAQ: 'SSS',
          LANDING_NAV_LOGIN: 'Giriş Yap',
          LANDING_NAV_START: 'Hemen Başla',
          LANDING_CTA_FREE_TRIAL: '14 gün ücretsiz dene',
          LANDING_CTA_NO_CC: 'Kredi kartı gerekmez',
          LANDING_CONTACT_TOPIC_GENERAL: 'Genel',
          LANDING_CONTACT_TOPIC_SALES: 'Satış',
          LANDING_CONTACT_TOPIC_SUPPORT: 'Destek',
          LANDING_CONTACT_TOPIC_PRESS: 'Basın',
          LANDING_CONTACT_SUBMIT_SUCCESS: 'Mesajınız iletildi! En kısa sürede dönüş yapacağız.',
          LANDING_CONTACT_SUBMIT_ERROR: 'Bir hata oluştu, lütfen tekrar deneyin.',
          LANDING_STATS_LOADING: 'Yükleniyor...',
          LANDING_FAQ_EMPTY: 'Bu kategoride henüz soru bulunmuyor.',
        },
      },
      en: {
        landing: {
          LANDING_NAV_FEATURES: 'Features',
          LANDING_NAV_PRICING: 'Pricing',
          LANDING_NAV_HOW_IT_WORKS: 'How It Works',
          LANDING_NAV_FAQ: 'FAQ',
          LANDING_NAV_LOGIN: 'Log In',
          LANDING_NAV_START: 'Get Started',
          LANDING_CTA_FREE_TRIAL: 'Try free for 14 days',
          LANDING_CTA_NO_CC: 'No credit card required',
          LANDING_CONTACT_TOPIC_GENERAL: 'General',
          LANDING_CONTACT_TOPIC_SALES: 'Sales',
          LANDING_CONTACT_TOPIC_SUPPORT: 'Support',
          LANDING_CONTACT_TOPIC_PRESS: 'Press',
          LANDING_CONTACT_SUBMIT_SUCCESS: 'Your message has been sent! We will get back to you shortly.',
          LANDING_CONTACT_SUBMIT_ERROR: 'An error occurred, please try again.',
          LANDING_STATS_LOADING: 'Loading...',
          LANDING_FAQ_EMPTY: 'No questions in this category yet.',
        },
      },
    },
    ns: ['landing'],
    defaultNS: 'landing',
    interpolation: { escapeValue: false },
  });

export default i18n;
