import React, { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'Ücretsiz plan neler içeriyor?',
    answer:
      '14 günlük ücretsiz deneme süresinde E-Ticaret modülüne tam erişim sağlarsınız. Kredi kartı bilgisi gerekmez. Süre dolduğunda verileriniz 30 gün daha saklanır.',
  },
  {
    question: 'Planı istediğim zaman değiştirebilir miyim?',
    answer:
      'Evet, Starter ve Pro planlar arasında istediğiniz zaman geçiş yapabilirsiniz. Yükseltme anında aktif olur, düşürmeler bir sonraki dönem başında geçerli olur.',
  },
  {
    question: 'Verilerim güvende mi?',
    answer:
      'Her mağaza için ayrı, izole bir veritabanı oluşturulur. Verileriniz Türkiye lokasyonlu sunucularda KVKK uyumlu şekilde saklanır.',
  },
  {
    question: 'Hangi ödeme yöntemleri destekleniyor?',
    answer:
      'Kredi/banka kartı (Visa, Mastercard) ve havale/EFT ile ödeme yapabilirsiniz. Türk lirasıyla faturalandırma yapılır.',
  },
  {
    question: 'Teknik destek nasıl işliyor?',
    answer:
      'Starter ve Pro planlarda 7/24 e-posta desteği mevcuttur. Pro planlarda öncelikli destek hattı ve 4 saatlik yanıt süresi garantisi sunulmaktadır.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="landing-faq">
      <div className="landing-section-header">
        <h2>Sık Sorulan Sorular</h2>
        <p>Aklınızdaki soruların cevapları burada.</p>
      </div>

      <div className="landing-faq-list">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          const regionId = `faq-region-${index}`;
          const btnId = `faq-btn-${index}`;

          return (
            <div
              key={index}
              className={`landing-faq-item${isOpen ? ' open' : ''}`}
            >
              <button
                id={btnId}
                className="landing-faq-question"
                aria-expanded={isOpen}
                aria-controls={regionId}
                onClick={() => toggle(index)}
              >
                {faq.question}
                <span className="landing-faq-chevron" aria-hidden="true">▾</span>
              </button>

              <div
                id={regionId}
                role="region"
                aria-labelledby={btnId}
                className="landing-faq-answer-wrap"
              >
                <div className="landing-faq-answer-inner">
                  <p className="landing-faq-answer">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="landing-faq-footer">
        Başka sorunuz mu var?{' '}
        <a href="mailto:destek@wixiapp.com">Bize Ulaşın →</a>
      </div>
    </section>
  );
};
