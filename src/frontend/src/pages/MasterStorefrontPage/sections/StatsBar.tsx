import React, { useEffect, useRef, useState } from 'react';

interface StatDef {
  value: number | null;
  suffix: string;
  prefix: string;
  label: string;
  staticText?: string;
}

const STATS: StatDef[] = [
  { value: 1250, suffix: '+', prefix: '', label: 'Aktif Mağaza' },
  { value: 4.5, suffix: 'M+', prefix: '₺', label: 'İşlem Hacmi' },
  { value: 99.9, suffix: '', prefix: '%', label: 'Uptime' },
  { value: null, suffix: '', prefix: '', label: 'Destek', staticText: '7/24' },
];

function useCountUp(target: number, duration: number, active: boolean): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration]);

  return current;
}

interface StatItemProps {
  stat: StatDef;
  active: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ stat, active }) => {
  const rawValue = useCountUp(stat.value ?? 0, 1800, active && stat.value !== null);

  const formatValue = (): string => {
    if (stat.staticText) return stat.staticText;
    if (stat.value === null) return '0';
    const v = stat.value;
    if (Number.isInteger(v)) {
      return Math.round(rawValue).toLocaleString('tr-TR');
    }
    return rawValue.toFixed(1);
  };

  return (
    <div className="landing-stat-item">
      <span className="landing-stat-value">
        {stat.prefix}{formatValue()}{stat.suffix}
      </span>
      <span className="landing-stat-label">{stat.label}</span>
    </div>
  );
};

export const StatsBar: React.FC = () => {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="landing-stats" ref={ref} aria-label="Platform istatistikleri">
      <div className="landing-stats-grid">
        {STATS.map((stat) => (
          <StatItem key={stat.label} stat={stat} active={active} />
        ))}
      </div>
    </section>
  );
};
