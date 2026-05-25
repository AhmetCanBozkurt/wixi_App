import { useEffect } from 'react';

/** Adds 'in' class to elements with fade-up/slide-in/scale-in classes when they enter viewport */
export function useScrollReveal() {
  useEffect(() => {
    const sel = '.fade-up, .slide-in-l, .slide-in-r, .scale-in';
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll(sel).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Animates a number from 0 to target when triggered */
export function useCountUp() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            if (el.dataset.counted) return;
            el.dataset.counted = '1';
            const target = parseFloat(el.dataset.count || '0');
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const dur = parseInt(el.dataset.duration || '1400', 10);
            const start = performance.now();
            const ease = (t: number) => 1 - Math.pow(1 - t, 3);
            function step(now: number) {
              const t = Math.min(1, (now - start) / dur);
              const v = target * ease(t);
              const formatted =
                decimals > 0
                  ? v.toFixed(decimals)
                  : Math.floor(v).toLocaleString('tr-TR');
              el.textContent = prefix + formatted + suffix;
              if (t < 1) requestAnimationFrame(step);
              else
                el.textContent =
                  prefix +
                  (decimals > 0
                    ? target.toFixed(decimals)
                    : target.toLocaleString('tr-TR')) +
                  suffix;
            }
            requestAnimationFrame(step);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-count]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
