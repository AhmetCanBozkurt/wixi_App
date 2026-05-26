/* ============================================================
   WIXI — Shared interactions & animations
   ============================================================ */

(function(){
  'use strict';

  /* ---------- Nav scroll state + mobile drawer ---------- */
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const drawer = document.querySelector('.nav__drawer');

  const onScroll = ()=>{
    if(nav){
      if(window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    // Scroll progress
    const bar = document.querySelector('.scroll-progress__bar');
    if(bar){
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    }
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  if(burger && drawer){
    burger.addEventListener('click', ()=>{
      const isOpen = drawer.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    drawer.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        drawer.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  /* ---------- Scroll reveal observer ---------- */
  const revealSel = '.fade-up, .slide-in-l, .slide-in-r, .scale-in';
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        // Trigger count-up if present
        if(e.target.matches('[data-count]')){
          countUp(e.target);
        }
        e.target.querySelectorAll('[data-count]:not(.counted)').forEach(countUp);
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
  document.querySelectorAll(revealSel).forEach(el=>io.observe(el));
  document.querySelectorAll('[data-count]').forEach(el=>{
    // Also observe loose count targets
    if(!el.closest(revealSel)) io.observe(el);
  });

  /* ---------- Count-up animation ---------- */
  function countUp(el){
    if(el.classList.contains('counted')) return;
    el.classList.add('counted');
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const dur = parseInt(el.dataset.duration || '1400', 10);
    const start = performance.now();
    const ease = (t)=> 1 - Math.pow(1 - t, 3); // ease-out cubic
    function step(now){
      const t = Math.min(1, (now - start)/dur);
      const v = target * ease(t);
      const formatted = decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString('tr-TR');
      el.textContent = prefix + formatted + suffix;
      if(t < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString('tr-TR')) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------- 3D tilt cards ---------- */
  const tiltEls = document.querySelectorAll('.tilt');
  tiltEls.forEach(el=>{
    let rect = null;
    const max = 8; // deg
    function onMove(e){
      if(!rect) rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * max;
      const ry = (x - 0.5) * max;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
    function reset(){
      el.style.transform = '';
      rect = null;
    }
    el.addEventListener('mouseenter', ()=>{rect = el.getBoundingClientRect()});
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', reset);
  });

  /* ---------- Magnetic buttons ---------- */
  const magnetEls = document.querySelectorAll('[data-magnet]');
  magnetEls.forEach(el=>{
    const strength = parseFloat(el.dataset.magnet) || 0.3;
    el.addEventListener('mousemove', (e)=>{
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      el.style.transform = `translate(${x*strength}px, ${y*strength}px)`;
    });
    el.addEventListener('mouseleave', ()=>{ el.style.transform = '' });
  });

  /* ---------- Highlight active nav link by pathname ---------- */
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav__links a, .nav__drawer a').forEach(a=>{
    const href = (a.getAttribute('href') || '').toLowerCase();
    if(href === path || (path === '' && href === 'index.html')){
      a.classList.add('active');
    }
  });

  /* ---------- Hero parallax (mouse-based) ---------- */
  const parallaxRoot = document.querySelector('[data-parallax-root]');
  if(parallaxRoot){
    const items = parallaxRoot.querySelectorAll('[data-parallax]');
    parallaxRoot.addEventListener('mousemove', (e)=>{
      const r = parallaxRoot.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - 0.5;
      const y = (e.clientY - r.top)/r.height - 0.5;
      items.forEach(it=>{
        const depth = parseFloat(it.dataset.parallax) || 0.5;
        it.style.transform = `translate(${x * depth * 30}px, ${y * depth * 30}px)`;
      });
    });
    parallaxRoot.addEventListener('mouseleave', ()=>{
      items.forEach(it=>{ it.style.transform = '' });
    });
  }

  /* ---------- THEME ---------- */
  const root = document.documentElement;
  const stored = localStorage.getItem('wixi-theme');
  const initial = stored || 'dark';
  root.setAttribute('data-theme', initial);

  function buildThemeToggle(){
    const cta = document.querySelector('.nav__cta');
    if(!cta || cta.querySelector('.theme-toggle')) return;
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Tema değiştir');
    btn.innerHTML = `
      <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
    `;
    btn.addEventListener('click', ()=>{
      const cur = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = cur === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('wixi-theme', next);
    });
    // Insert before the burger
    const burger = cta.querySelector('.nav__burger');
    if(burger) cta.insertBefore(btn, burger);
    else cta.appendChild(btn);
  }
  buildThemeToggle();

  /* ---------- LANG SWITCHER ---------- */
  const LANGS = [
    {code:'tr', flag:'🇹🇷', name:'Türkçe'},
    {code:'en', flag:'🇬🇧', name:'English'},
    {code:'de', flag:'🇩🇪', name:'Deutsch'},
    {code:'ar', flag:'🇸🇦', name:'العربية'},
    {code:'fr', flag:'🇫🇷', name:'Français'}
  ];
  function buildLangSwitch(){
    const cta = document.querySelector('.nav__cta');
    if(!cta || cta.querySelector('.lang-switch')) return;
    const wrap = document.createElement('div');
    wrap.className = 'lang-switch';
    const current = localStorage.getItem('wixi-lang') || 'tr';
    const curLang = LANGS.find(l => l.code === current) || LANGS[0];
    wrap.innerHTML = `
      <button class="lang-switch__btn" type="button" aria-haspopup="menu" aria-expanded="false">
        <span class="flag">${curLang.flag}</span>
        <span class="code">${curLang.code}</span>
        <span class="chev"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
      </button>
      <div class="lang-switch__menu" role="menu">
        ${LANGS.map(l => `
          <button type="button" data-code="${l.code}" class="${l.code === current ? 'is-current' : ''}" role="menuitem">
            <span class="flag">${l.flag}</span>
            <span>${l.name}</span>
            <span class="check">✓</span>
          </button>
        `).join('')}
      </div>
    `;
    // Insert before theme toggle if exists, else before burger
    const tt = cta.querySelector('.theme-toggle');
    const burger = cta.querySelector('.nav__burger');
    cta.insertBefore(wrap, tt || burger || null);

    const btn = wrap.querySelector('.lang-switch__btn');
    const menu = wrap.querySelector('.lang-switch__menu');
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', (e)=>{
      if(!wrap.contains(e.target)){
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    });
    menu.addEventListener('click', (e)=>{
      const b = e.target.closest('button[data-code]');
      if(!b) return;
      const code = b.dataset.code;
      localStorage.setItem('wixi-lang', code);
      const lang = LANGS.find(l => l.code === code);
      btn.querySelector('.flag').textContent = lang.flag;
      btn.querySelector('.code').textContent = lang.code;
      menu.querySelectorAll('button').forEach(x => x.classList.toggle('is-current', x.dataset.code === code));
      // RTL toggle
      document.documentElement.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', code);
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      // Toast feedback
      const toast = document.createElement('div');
      toast.textContent = `${lang.flag}  ${lang.name} seçildi`;
      toast.style.cssText = 'position:fixed;bottom:100px;right:24px;padding:12px 18px;border-radius:12px;background:var(--grad);color:#fff;font-size:13px;font-weight:600;box-shadow:0 18px 40px -12px rgba(99,102,241,.6);z-index:200;opacity:0;transform:translateY(10px);transition:opacity .25s,transform .25s';
      document.body.appendChild(toast);
      requestAnimationFrame(()=>{toast.style.opacity='1';toast.style.transform='none'});
      setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translateY(10px)';setTimeout(()=>toast.remove(),300)}, 1800);
    });
    // Restore RTL on init
    if(current === 'ar'){
      document.documentElement.setAttribute('dir','rtl');
      document.documentElement.setAttribute('lang','ar');
    }
  }
  buildLangSwitch();

  /* ---------- CHAT WIDGET ---------- */
  function buildChat(){
    if(document.querySelector('.chat-launcher')) return;

    const launcher = document.createElement('button');
    launcher.className = 'chat-launcher';
    launcher.setAttribute('aria-label', 'Canlı destek');
    launcher.innerHTML = `
      <svg class="ic-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      <svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      <span class="badge">1</span>
    `;

    const panel = document.createElement('div');
    panel.className = 'chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Canlı destek');
    panel.innerHTML = `
      <div class="chat-head">
        <div class="chat-head__row">
          <div class="chat-head__avatars">
            <span>EY</span><span>MK</span><span>AY</span>
          </div>
          <div class="chat-head__info">
            <b>Wixi Destek</b>
            <span class="status">Şu an aktif — ort. yanıt 30sn</span>
          </div>
        </div>
      </div>
      <div class="chat-body" id="chatBody">
        <div class="msg agent">
          Merhaba! 👋 Ben Elif, Wixi destek ekibinden. Size nasıl yardımcı olabilirim?
          <div class="msg__time">şimdi</div>
        </div>
      </div>
      <div class="chat-quick" id="chatQuick">
        <button data-q="Fiyatlandırma hakkında">💳 Fiyatlandırma</button>
        <button data-q="Demo izleyebilir miyim?">📺 Demo izle</button>
        <button data-q="Modül listesi">🧩 Modüller</button>
        <button data-q="Veri taşıma">📦 Veri taşıma</button>
      </div>
      <div class="chat-input">
        <input type="text" id="chatInput" placeholder="Mesajınızı yazın..." />
        <button class="send" id="chatSend" aria-label="Gönder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div class="chat-foot">Yanıtlar Wixi <strong>Destek</strong> ekibi tarafından sağlanır</div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    function toggleChat(open){
      const willOpen = open === undefined ? !launcher.classList.contains('open') : open;
      launcher.classList.toggle('open', willOpen);
      panel.classList.toggle('open', willOpen);
      if(willOpen){
        setTimeout(()=> document.getElementById('chatInput').focus(), 300);
        const badge = launcher.querySelector('.badge');
        if(badge) badge.style.display = 'none';
      }
    }
    launcher.addEventListener('click', ()=> toggleChat());

    const body = document.getElementById('chatBody');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');
    const quick = document.getElementById('chatQuick');

    function now(){
      const d = new Date();
      return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
    }
    function addMsg(text, who){
      const el = document.createElement('div');
      el.className = 'msg ' + who;
      el.innerHTML = text + `<div class="msg__time">${now()}</div>`;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
    }
    function addTyping(){
      const t = document.createElement('div');
      t.className = 'typing';
      t.id = '__typing';
      t.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(t);
      body.scrollTop = body.scrollHeight;
      return t;
    }
    function removeTyping(){
      const t = document.getElementById('__typing');
      if(t) t.remove();
    }

    const replies = {
      'fiyat': 'Fiyatlandırma detaylı sayfamıza göz atabilirsiniz: <a href="fiyatlandirma.html" style="color:#a5b4fc;text-decoration:underline">fiyatlandırma sayfası</a>. Standart ₺499, Premium ₺1.299, Kurumsal için bizimle iletişime geçin.',
      'demo': 'Tabii! Demo hesabımıza tek tıkla erişebilirsiniz. Ayrıca 14 gün ücretsiz kendi hesabınızı oluşturabilirsiniz — kredi kartı gerekmez.',
      'modül': 'Aktif modüllerimiz: E-Ticaret, CRM, İnsan Kaynakları. Q2 2026\'da Muhasebe modülü geliyor. Modülleri istediğiniz an açıp kapatabilirsiniz.',
      'veri': 'Shopify, WooCommerce, Trendyol, İdeasoft\'tan ücretsiz veri taşıma desteği veriyoruz. Premium ve Kurumsal planlarda dahil.',
      'güven': 'Tüm veriler Türkiye\'deki KVKK uyumlu, ISO 27001 sertifikalı veri merkezlerinde tutulur. Her tenant izole altyapıdadır.',
      'default': 'Bu konuda size en doğru bilgiyi vermek için bir uzmanımıza yönlendiriyorum. Birkaç saniye içinde size dönüş yapılacak — ya da <a href="sss.html" style="color:#a5b4fc;text-decoration:underline">SSS sayfamıza</a> göz atabilirsiniz.'
    };
    function botReply(userText){
      const t = userText.toLowerCase();
      let key = 'default';
      if(t.includes('fiyat') || t.includes('ücret') || t.includes('plan')) key = 'fiyat';
      else if(t.includes('demo') || t.includes('izle') || t.includes('dene')) key = 'demo';
      else if(t.includes('modül')) key = 'modül';
      else if(t.includes('veri') || t.includes('taşı') || t.includes('import') || t.includes('aktar')) key = 'veri';
      else if(t.includes('güven') || t.includes('kvkk') || t.includes('iso') || t.includes('yedek')) key = 'güven';
      const reply = replies[key];

      addTyping();
      setTimeout(()=>{
        removeTyping();
        addMsg(reply, 'agent');
      }, 900 + Math.random()*600);
    }

    function sendUser(text){
      const t = (text || '').trim();
      if(!t) return;
      addMsg(t.replace(/</g,'&lt;'), 'user');
      input.value = '';
      botReply(t);
    }
    send.addEventListener('click', ()=> sendUser(input.value));
    input.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){ e.preventDefault(); sendUser(input.value) }
    });
    quick.addEventListener('click', (e)=>{
      const b = e.target.closest('button');
      if(!b) return;
      sendUser(b.dataset.q);
    });
  }
  buildChat();
})();
