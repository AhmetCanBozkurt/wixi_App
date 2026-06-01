import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import { useRoadmapQuery, useVoteRoadmapMutation } from '../../../entities/landing';
import { getSessionToken } from '../../../shared/utils/sessionToken';
import s from './YolHaritasiPage.module.css';

const PHASE_LABELS: Record<string, { label: string; statusClass: string }> = {
  shipped: { label: 'Tamamlandı', statusClass: s.colShipped },
  now:     { label: 'Şimdi',      statusClass: s.colNow },
  next:    { label: 'Sırada',     statusClass: s.colNext },
  later:   { label: 'Daha sonra', statusClass: s.colLater },
};

const TAG_CLASS: Record<string, string> = {
  feature:     'tagFeature',
  improvement: 'tagImprovement',
  fix:         'tagFix',
};

export function YolHaritasiPage() {
  useScrollReveal();
  const { i18n } = useTranslation();
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const { data, isLoading } = useRoadmapQuery(i18n.language);
  const voteMutation = useVoteRoadmapMutation();

  const handleVote = (itemId: string, isShipped: boolean) => {
    if (isShipped || voted.has(itemId)) return;
    setVoted((prev) => new Set(prev).add(itemId));
    voteMutation.mutate({ itemId, sessionToken: getSessionToken() });
  };

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Yol Haritası</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Sırada <span className="lp-grad-text">ne var?</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Wixi'nin yakında nereye gittiğini sizinle paylaşıyoruz. Beğendiğiniz özellikleri oylayın — önceliklendirmemize yardımcı olun.</p>
          <div className={`${s.legend} fade-up`} data-delay="3">
            <span className={`${s.legendItem} ${s.legendShipped}`}><span className={s.legendDot} />Tamamlandı</span>
            <span className={`${s.legendItem} ${s.legendNow}`}><span className={s.legendDot} />Şimdi · Q1 2026</span>
            <span className={`${s.legendItem} ${s.legendNext}`}><span className={s.legendDot} />Sırada · Q2 2026</span>
            <span className={`${s.legendItem} ${s.legendLater}`}><span className={s.legendDot} />Daha sonra</span>
          </div>
        </div>
      </section>

      <section className={s.cols}>
        <div className="lp-container">
          {isLoading && <div>Yükleniyor...</div>}
          <div className={s.colsGrid}>
            {data?.phases.map((col, ci) => {
              const phaseStyle = PHASE_LABELS[col.phaseId] ?? { label: col.phaseLabel, statusClass: '' };
              return (
                <div key={col.phaseId} className={`${s.rmCol} lp-glass ${phaseStyle.statusClass} fade-up`} data-delay={String(ci)}>
                  <div className={s.rmColHead}>
                    <h3>{phaseStyle.label}</h3>
                    <span className={s.rmStatus}>{col.phaseLabel}</span>
                  </div>
                  {col.items.map((item) => {
                    const isVoted = voted.has(item.id);
                    return (
                      <div key={item.id} className={`${s.rmItem} ${item.isShipped ? s.rmItemShipped : ''}`}>
                        <div className={s.rmItemHead}>
                          <b>{item.isShipped ? '✓ ' : ''}{item.title}</b>
                          <span className={s.rmItemCat}>{item.category}</span>
                        </div>
                        <p>{item.description}</p>
                        <div className={s.rmItemFoot}>
                          <span className={s.rmItemDate}>{item.plannedDate}</span>
                          <button
                            className={`${s.rmVote} ${item.isShipped || isVoted ? s.rmVoteDone : ''}`}
                            onClick={() => handleVote(item.id, item.isShipped)}
                          >
                            {item.isShipped ? '✓ Yayında' : `▲ ${item.voteCount}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={s.beta}>
        <div className="lp-container">
          <div className={`${s.betaCard} fade-up`}>
            <div>
              <span className="lp-eyebrow"><span className="lp-dot" />Beta Programı</span>
              <h3>Yenilikleri herkesten önce deneyin</h3>
              <p>Wixi Beta programına katılarak yeni özellikleri 4-6 hafta önceden test edin, ekibimize doğrudan geri bildirim verin.</p>
              <ul className={s.betaFeatures}>
                {['Erken erişim — yayından 1+ ay önce', 'Ürün ekibiyle aylık görüşme', 'Beta özellikler ücretsiz', 'Yıllık plan %15 indirim'].map((f) => (
                  <li key={f}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className={s.betaCta}>
              <div className={s.betaNum}>142</div>
              <div className={s.betaLbl}>aktif beta üyesi</div>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Beta'ya Katıl →</a>
            </div>
          </div>
        </div>
      </section>

      <section className={s.changes}>
        <div className="lp-container">
          <div className={`${s.changesHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Değişiklik Günlüğü</span>
            <h2>Son <span className="lp-grad-text">güncellemeler</span></h2>
            <p>Her yeni sürümde neler değişti, hangi sorunlar giderildi.</p>
          </div>
          <div className="lp-glass">
            {isLoading && <div>Yükleniyor...</div>}
            {data?.changelog.map((c) => {
              const tagClass = TAG_CLASS[c.tag] ?? 'tagFix';
              return (
                <div key={c.id} className={s.changeItem}>
                  <div className={s.changeDate}>
                    <b>{c.version}</b>
                    {c.releaseDate}
                  </div>
                  <div className={s.changeBody}>
                    <h4>
                      {c.title}
                      <span className={s[tagClass as keyof typeof s]}>{c.tag}</span>
                    </h4>
                    <p>{c.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ padding: '0 0 100px' }}>
        <div className="lp-container" style={{ textAlign: 'center' }}>
          <Link to="/iletisim" className="lp-btn lp-btn--ghost">Özellik önerisi gönderin →</Link>
        </div>
      </div>
    </LandingLayout>
  );
}
