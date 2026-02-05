"use client";

import { useState, useEffect } from "react";
import { DAILY_REFLECTIONS } from "@/config/daily-reflections";

export default function DailyReflectionSection({ locale }: { locale: "en" | "es" }) {
  const [card, setCard] = useState<{ en: string; es: string } | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = dayOfYear % DAILY_REFLECTIONS.length;
    setCard(DAILY_REFLECTIONS[index]);

    const lastReveal = localStorage.getItem("last_reveal_date");
    if (lastReveal === now.toDateString()) {
      setIsRevealed(true);
      setIsAnimating(true);
    }
  }, []);

  const handleReveal = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      setTimeout(() => {
        setIsAnimating(true);
        localStorage.setItem("last_reveal_date", new Date().toDateString());
      }, 50);
    } else {
      // 觸發呼吸動畫
      setIsPulsing(true);
      // 1.2 秒的完整呼吸週期
      setTimeout(() => setIsPulsing(false), 1200); 
    }
  };

  const ui = {
    en: {
      title: "Daily Reflection Card",
      subtitle: "One quiet thought for today.",
      revealBtn: "Reveal Today’s Reflection",
      reflectAgain: "Reflect Again",
      updatedOnce: "Updated once every day.",
      meaningTip: "This reflection is shared today, but what it means depends on you.",
      nextDay: "A new reflection will appear tomorrow.",
      wantDeeper: "Want a deeper personal reflection?",
      transitionDesc: "Today’s card offers a general reflection. Your full profile explores patterns shaped by your birth time and personal context.",
      actionBtn: "Generate My Full Reflection",
      aiSub: "AI-generated cultural and personal reflection",
      disclaimer: "For entertainment and self-exploration purposes only. This service does not provide medical, legal, or financial advice."
    },
    es: {
      title: "Carta de Reflexión Diaria",
      subtitle: "Un pensamiento tranquilo para hoy.",
      revealBtn: "Revelar Reflexión de Hoy",
      reflectAgain: "Reflexionar de Nuevo",
      updatedOnce: "Actualizado una vez al día.",
      meaningTip: "Esta reflexión se comparte hoy, pero lo que significa depende de ti.",
      nextDay: "Una nueva reflexión aparecerá mañana.",
      wantDeeper: "¿Quieres una reflexión personal más profunda?",
      transitionDesc: "La carta de hoy ofrece una reflexión general. Tu perfil completo explora patrones formados por tu hora de nacimiento y contexto personal.",
      actionBtn: "Generar Mi Reflexión Completa",
      aiSub: "Reflexión cultural y personal generada por IA",
      disclaimer: "Solo para fines de entretenimiento y autoexploración. Este servicio no brinda asesoría médica, legal o financiera."
    }
  }[locale];

  if (!card) return null;

  return (
    <section className="max-w-2xl mx-auto px-4 py-1 text-center select-none">
      {/* ① 區塊標題 */}
      <div className="mb-4 space-y-1">
        <h2 className="text-3xl md:text-4xl font-serif text-[#0f3d2e] tracking-tight">
          {ui.title}
        </h2>
        <p className="text-[#356f5b]/40 text-sm font-light tracking-widest uppercase">
          {ui.subtitle}
        </p>
      </div>

      {/* 卡片主體 */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_20px_50px_rgba(15,61,46,0.05)] mb-2 min-h-[350px] flex flex-col items-center justify-center transition-all duration-700">
        
        {/* 背景光暈 */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(15,61,46,0.03),transparent)] pointer-events-none" />

        {!isRevealed ? (
          /* ② 未揭示狀態：顯示初始大按鈕 */
          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={handleReveal}
              className="relative px-10 py-5 bg-[#0f3d2e] text-white rounded-full text-lg font-medium transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl shadow-[#0f3d2e]/20"
            >
              <span className="relative z-10 tracking-wide">{ui.revealBtn}</span>
            </button>
            <p className="text-xs text-[#356f5b]/50 italic font-light tracking-wide">
              {ui.updatedOnce}
            </p>
          </div>
        ) : (
          /* ③ 揭示後的內容結構 */
          <div 
            className={`flex flex-col items-center text-center transition-all ease-out
              ${isAnimating ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-2xl scale-95'}
              ${isPulsing ? 'animate-soft-breathe' : ''}
            `}
            style={{ transitionDuration: '1000ms' }}
          >
            <p className="text-[#0f3d2e] text-3xl md:text-5xl font-serif italic mb-6 leading-[1.45] max-w-[95%]">
              "{card[locale]}"
            </p>
            
            <p className="text-[#356f5b]/70 text-sm max-w-[85%] mx-auto mb-8 font-light">
              {ui.meaningTip}
            </p>

            {/* 可重複點擊的小按鈕 */}
            <button
              onClick={handleReveal}
              className="mb-8 px-6 py-2 border border-[#0f3d2e]/20 text-[#0f3d2e]/60 rounded-full text-xs font-medium hover:bg-[#0f3d2e]/5 transition-all active:scale-95"
            >
              {ui.reflectAgain}
            </button>

            <div className="w-16 h-[1px] bg-[#0f3d2e]/10 mb-2" />
            <p className="text-[10px] text-[#356f5b]/60 tracking-[0.25em] uppercase font-medium">
              {ui.nextDay}
            </p>
          </div>
        )}
      </div>

      {/* 二、過渡區 */}
      <div className="relative pt-3 pb-1">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#0f3d2e]/20 to-transparent" />
        
        <div className="space-y-1 mb-3">
          <h4 className="text-[#0f3d2e] text-xl font-bold tracking-tight">
            {ui.wantDeeper}
          </h4>
          <p className="text-base text-[#356f5b]/70 max-w-md mx-auto px-4">
            {ui.transitionDesc}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button 
            onClick={() => {
              const element = document.getElementById('calculator-form');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-12 py-4 border-2 border-[#0f3d2e]/40 text-[#0f3d2e] rounded-full text-lg font-bold hover:bg-[#0f3d2e] hover:text-white transition-all duration-300"
          >
            {ui.actionBtn}
          </button>
          <p className="mt-1 text-sm text-[#356f5b] font-semibold uppercase tracking-[0.1em]">
            {ui.aiSub}
          </p>
        </div>

      {/* ⑧ 免責聲明區塊 */}
      <div className="mt-2 opacity-40 hover:opacity-100 transition-opacity duration-500"> 
        {/* opacity-30 改為 60，讓它平時就清晰一點 */}
        <p className="text-xs text-[#356f5b] leading-relaxed max-w-sm mx-auto font-normal">
          {/* text-[11px] 改為 text-xs | 確保沒有透明度斜槓 */}
          {ui.disclaimer}
        </p>
      </div>
      </div>




{/* 自定義細膩呼吸動畫 */}
<style jsx global>{`
        @keyframes soft-breathe {
          0% { 
            filter: blur(0px) brightness(1);
            transform: scale(1);
          }
          50% { 
            filter: blur(1px) brightness(1.3); /* 輕微模糊增加靈性感 */
            transform: scale(1.02); /* 極細微的放大 */
            text-shadow: 0 0 15px rgba(15, 61, 46, 0.2); /* 淡淡的光暈 */
          }
          100% { 
            filter: blur(0px) brightness(1);
            transform: scale(1);
          }
        }
        .animate-soft-breathe {
          animation: soft-breathe 1.2s ease-in-out;
        }
      `}</style>

    </section>
  );
}