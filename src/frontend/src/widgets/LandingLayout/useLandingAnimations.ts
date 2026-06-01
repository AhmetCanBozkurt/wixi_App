import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.fade-up, .slide-in-l, .slide-in-r, .scale-in');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export function useCountUp() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-count]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseFloat(el.dataset.count ?? '0');
          const decimals = parseInt(el.dataset.decimals ?? '0', 10);
          const prefix = el.dataset.prefix ?? '';
          const suffix = el.dataset.suffix ?? '';
          const dur = 1600;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            const val = ease * target;
            el.textContent = `${prefix}${val.toFixed(decimals)}${suffix}`;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export function useTilt(selector = '.tilt') {
  useEffect(() => {
    const MAX = 15;
    const els = document.querySelectorAll<HTMLElement>(selector);

    type Handler = { el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void };
    const handlers: Handler[] = [];

    els.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * MAX * 2}deg) rotateX(${-y * MAX}deg) scale(1.02)`;
        el.style.transition = 'transform .08s ease';
      };
      const leave = () => {
        el.style.transform = '';
        el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      handlers.push({ el, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, [selector]);
}

export function useMagnet() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-magnet]');

    type Handler = { el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void };
    const handlers: Handler[] = [];

    els.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.4;
        const y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.transform = `translate(${x}px,${y}px) scale(1.04)`;
        el.style.transition = 'transform .1s ease';
      };
      const leave = () => {
        el.style.transform = '';
        el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      handlers.push({ el, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);
}

export function useSpotlight() {
  // Attach to parent of every .lp-spotlight element
  const _ref = useRef<null>(null);
  void _ref;

  useEffect(() => {
    const spotlights = document.querySelectorAll<HTMLElement>('.lp-spotlight');
    const parents = new Map<HTMLElement, { move: (e: MouseEvent) => void; leave: () => void }>();

    spotlights.forEach((sp) => {
      const parent = sp.parentElement;
      if (!parent || parents.has(parent)) return;

      const move = (e: MouseEvent) => {
        const r = parent.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        sp.style.setProperty('--mx', x + '%');
        sp.style.setProperty('--my', y + '%');
        sp.classList.add('on');
      };
      const leave = () => sp.classList.remove('on');

      parent.addEventListener('mousemove', move);
      parent.addEventListener('mouseleave', leave);
      parents.set(parent, { move, leave });
    });

    return () => {
      parents.forEach(({ move, leave }, parent) => {
        parent.removeEventListener('mousemove', move);
        parent.removeEventListener('mouseleave', leave);
      });
    };
  }, []);
}
