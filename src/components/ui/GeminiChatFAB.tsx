'use client';

/**
 * src/components/ui/GeminiChatFAB.tsx
 *
 * Bouton flottant Gemini (remplace l'ancien bouton WhatsApp).
 * Ouvre un popup de chat alimenté par l'IA Gemini.
 */
import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, Bot } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME: Message = {
  role: 'assistant',
  text: "Bonjour ! Je suis l'assistant ProxiServ 👋\nComment puis-je vous aider à trouver le bon prestataire ?",
};

export default function GeminiChatFAB() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll au bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, open]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      setHistory([...nextHistory, { role: 'assistant', text: data.reply }]);
    } catch {
      setHistory([
        ...nextHistory,
        { role: 'assistant', text: "Désolé, une erreur s'est produite. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Masquer sur les pages auth
  if (pathname.includes('/login') || pathname.includes('/register')) return null;

  return (
    <>
      {/* ── Chat popup ────────────────────────────────────────────── */}
      {open && (
        <div
          className="chat-popup fixed bottom-[88px] md:bottom-24 right-4 md:right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          style={{ height: 480 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Assistant ProxiServeur</p>
              <p className="text-indigo-200 text-xs">Propulsé par Gemini ✨</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 flex flex-col gap-3">
            {history.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
                  }`}
                  style={
                    msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }
                      : {}
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span className="text-xs text-gray-400">En train de répondre…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Votre message…"
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 transition-colors"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              aria-label="Envoyer"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── FAB button ────────────────────────────────────────────── */}
      <button
        id="gemini-chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Ouvrir l'assistant IA"
        className="gemini-glow fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}

        {/* Pulse ring */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          />
        )}
      </button>
    </>
  );
}
