import { type ReactNode, useEffect, useRef, useState } from 'react';
import './landing-tokens.css';
import { LandingNavbar } from './LandingNavbar';
import { LandingFooter } from './LandingFooter';
import s from './LandingLayout.module.css';

interface Props {
  children: ReactNode;
}

export function LandingLayout({ children }: Props) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('wixi-theme') as 'dark' | 'light') || 'dark';
  });
  const progressRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('wixi-theme', next);
  };

  useEffect(() => {
    const onScroll = () => {
      if (!progressRef.current) return;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressRef.current.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-shell" data-theme={theme}>
      {/* Scroll progress bar */}
      <div className="lp-scroll-progress">
        <div ref={progressRef} className="lp-scroll-progress__bar" />
      </div>

      {/* Animated background orbs */}
      <div className={s.orbs} aria-hidden="true">
        <div className={`${s.orb} ${s.orb1}`} />
        <div className={`${s.orb} ${s.orb2}`} />
        <div className={`${s.orb} ${s.orb3}`} />
      </div>

      {/* Background glow layers */}
      <div className={s.bgGlow} aria-hidden="true" />
      <div className={s.bgDots} aria-hidden="true" />

      <LandingNavbar theme={theme} onToggleTheme={toggleTheme} />

      <main className={`${s.main} lp-page-enter`}>
        {children}
      </main>

      <LandingFooter />
    </div>
  );
}
