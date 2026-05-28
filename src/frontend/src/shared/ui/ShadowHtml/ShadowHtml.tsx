/**
 * ShadowHtml — Custom HTML bileşenlerini Shadow DOM içinde izole eden wrapper.
 *
 * Neden Shadow DOM?
 *   - Bileşen içindeki <style> tagları sadece kendi shadow root'u etkiler.
 *   - Bileşen içindeki <script> tagları çalışır ama global CSS'i kirletmez.
 *   - Dış sayfanın CSS'i bileşen içine sızmaz (tam çift yönlü izolasyon).
 *
 * Kullanım:
 *   <ShadowHtml html="<style>h1{color:red}</style><h1>Merhaba</h1>" />
 */

import { useEffect, useRef } from 'react';

interface ShadowHtmlProps {
  /** İzole edilecek ham HTML string */
  html: string;
  /** Wrapper elementin ek CSS class'ı */
  className?: string;
  /** Wrapper elementin inline style'ı */
  style?: React.CSSProperties;
  /** Shadow root'a otomatik eklenen reset CSS (varsayılan: true) */
  addReset?: boolean;
}

const RESET_CSS = `
  :host {
    display: block;
    all: initial;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

export function ShadowHtml({ html, className, style, addReset = true }: ShadowHtmlProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  // Shadow root'u bir kez oluştur
  useEffect(() => {
    const host = hostRef.current;
    if (!host || shadowRef.current) return;

    try {
      shadowRef.current = host.attachShadow({ mode: 'open' });
    } catch {
      // Shadow DOM zaten eklenmiş (StrictMode çift çalışma durumu)
    }
  }, []);

  // HTML değiştiğinde shadow içeriğini güncelle
  useEffect(() => {
    const shadow = shadowRef.current;
    if (!shadow) return;

    // Eski içeriği temizle
    shadow.innerHTML = '';

    // Reset CSS'i ekle
    if (addReset) {
      const styleEl = document.createElement('style');
      styleEl.textContent = RESET_CSS;
      shadow.appendChild(styleEl);
    }

    // HTML'i geçici bir container'a parse et
    const template = document.createElement('template');
    template.innerHTML = html || '';
    const fragment = template.content.cloneNode(true);

    // <script> taglarını yeniden oluştur — cloneNode script'leri çalıştırmaz
    const scripts = Array.from((fragment as DocumentFragment).querySelectorAll('script'));
    const nonScriptContent = document.createDocumentFragment();

    // Script olmayan node'ları kopyala
    const cloned = template.content.cloneNode(true) as DocumentFragment;
    const scriptPlaceholders: { placeholder: Comment; original: HTMLScriptElement }[] = [];

    // Script'leri ayır ve placeholder koy
    cloned.querySelectorAll('script').forEach(s => {
      const placeholder = document.createComment('script-placeholder');
      s.parentNode?.replaceChild(placeholder, s);
      scriptPlaceholders.push({ placeholder, original: s });
    });

    shadow.appendChild(cloned);

    // Script'leri shadow root scope'unda çalıştır
    scriptPlaceholders.forEach(({ placeholder, original }) => {
      const newScript = document.createElement('script');

      // Attribute'ları kopyala (src, type, async vb.)
      Array.from(original.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (!original.src) {
        // Inline script — shadow root'a erişim için wrapper
        newScript.textContent = `(function(shadowRoot) { ${original.textContent} })(document.currentScript.getRootNode());`;
      }

      placeholder.parentNode?.replaceChild(newScript, placeholder);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, addReset]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ display: 'block', ...style }}
      data-shadow-html="true"
    />
  );
}
