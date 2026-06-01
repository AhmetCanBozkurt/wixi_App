import { useEffect, useRef, useState } from 'react';
import s from './LandingChatWidget.module.css';

interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

const QUICK_REPLIES = [
  'Fiyatlar ne kadar?',
  'Demo görebilir miyim?',
  'Hangi ödeme yöntemleri var?',
  'Destek nasıl çalışıyor?',
];

const BOT_REPLIES: Record<string, string> = {
  'Fiyatlar ne kadar?': '💡 Planlarımız aylık ₺499\'dan başlar. 14 gün ücretsiz deneme ile başlayabilirsiniz. /fiyatlandirma sayfasından detaylara bakabilirsiniz.',
  'Demo görebilir miyim?': '🎯 Kesinlikle! Demo hesabınızı hemen oluşturabilir ve tüm özellikleri 14 gün boyunca ücretsiz deneyebilirsiniz.',
  'Hangi ödeme yöntemleri var?': '💳 İyzipay, Stripe, kredi/banka kartı ve havale ile ödeme yapabilirsiniz. Kapıda ödeme seçeneği de mevcuttur.',
  'Destek nasıl çalışıyor?': '🚀 7/24 canlı destek sunuyoruz. Ortalama yanıt süremiz 30 saniyedir. Ayrıca kapsamlı bir bilgi bankamız ve video eğitimlerimiz mevcuttur.',
};

const GREETING = 'Merhaba! 👋 Ben Wixi Asistan. Size nasıl yardımcı olabilirim?';

let _uid = 1;
const uid = () => _uid++;

export function LandingChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: uid(), from: 'bot', text: GREETING },
  ]);
  const [typing, setTyping] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [showBadge, setShowBadge] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleOpen = () => {
    setOpen(true);
    setShowBadge(false);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: uid(), from: 'user', text }]);
    setTyping(true);

    setTimeout(() => {
      const reply = BOT_REPLIES[text] ?? 'Anladım! Bir uzmanımız en kısa sürede sizinle iletişime geçecek. 🙌';
      setTyping(false);
      setMessages((prev) => [...prev, { id: uid(), from: 'bot', text: reply }]);
    }, 1000 + Math.random() * 600);
  };

  const handleQuickReply = (text: string) => {
    addUserMessage(text);
  };

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;
    setInputVal('');
    addUserMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Panel */}
      <div className={`${s.panel} ${open ? '' : s.panelHidden}`} role="dialog" aria-label="Wixi Asistan">
        {/* Head */}
        <div className={s.head}>
          <div className={s.avatar}>🤖</div>
          <div className={s.headInfo}>
            <p className={s.headName}>Wixi Asistan</p>
            <p className={s.headStatus}>
              <span className={s.statusDot} />
              Çevrimiçi · Ort. 30s yanıt
            </p>
          </div>
          <button className={s.closeBtn} onClick={() => setOpen(false)} aria-label="Kapat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className={s.messages}>
          {messages.map((m) => (
            <div key={m.id} className={`${s.msg} ${m.from === 'bot' ? s.msgBot : s.msgUser}`}>
              <div className={`${s.bubble} ${m.from === 'bot' ? s.bubbleBot : s.bubbleUser}`}>
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className={s.typing}>
              <span className={s.typingDot} />
              <span className={s.typingDot} />
              <span className={s.typingDot} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && !typing && (
          <div className={s.quickReplies}>
            {QUICK_REPLIES.map((q) => (
              <button key={q} className={s.quickBtn} onClick={() => handleQuickReply(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className={s.inputRow}>
          <input
            className={s.chatInput}
            type="text"
            placeholder="Bir şeyler yazın…"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className={s.sendBtn} onClick={handleSend} aria-label="Gönder">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Launcher */}
      <button
        className={`${s.launcher} ${open ? s.launcherClose : ''}`}
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label="Sohbeti aç"
      >
        {showBadge && !open && <span className={s.badge}>1</span>}
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>
    </>
  );
}
