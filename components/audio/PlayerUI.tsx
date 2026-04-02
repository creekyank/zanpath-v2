"use client";

import { useRadioStore } from "@/store/radioStore";
import { useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Gauge, BookOpenText } from "lucide-react";

export default function PlayerUI() {
  const { 
    isPlaying, play, pause, next, prev, queue, currentIndex, rate, setRate,
    showLyrics, toggleLyrics, currentChunks, currentChunkIndex 
  } = useRadioStore();
  
  const current = queue[currentIndex];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLyrics && scrollRef.current && scrollRef.current.children[currentChunkIndex]) {
      const activeItem = scrollRef.current.children[currentChunkIndex] as HTMLElement;
      activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentChunkIndex, showLyrics]);

  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] pointer-events-none px-0 sm:px-6 pb-0 sm:pb-3">
      <div 
        className="w-full max-w-5xl mx-auto transition-all duration-500 pointer-events-auto overflow-hidden sm:rounded-3xl"
        style={{ 
          background: 'rgba(255, 255, 255, 0.4)', // 💡 保持极高透明度
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* --- 1. 动态自适应歌词区域 --- */}
        {showLyrics && (
          <div className="w-full px-6 sm:px-12 bg-white/5 border-b border-white/10">
            <div 
              ref={scrollRef}
              // 💡 关键改动：去掉 h-16 固定高度，改用 min-h 和 max-h。
              // 这样 1 行时很窄，3 行时会自动长高，但绝不会被截断。
              className="min-h-[50px] max-h-[100px] w-full overflow-y-auto no-scrollbar py-3 scroll-smooth flex flex-col justify-center"
            >
              {currentChunks.map((chunk, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 text-center ${
                    index === currentChunkIndex 
                    ? "text-emerald-900 font-bold opacity-100 scale-100" 
                    : "opacity-0 h-0 overflow-hidden" 
                  }`}
                >
                  {/* 💡 紧凑行距 leading-tight，防止 3 行占用过多垂直空间 */}
                  <span className="text-[14px] leading-tight tracking-tight italic inline-block">
                    {chunk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 2. 控制栏主体 --- */}
        <div className="flex items-center justify-between gap-4 px-5 py-2">
          
          {/* 💡 标题区：flex-1 确保占据所有剩余空间 */}
          <div className="flex-1 flex flex-col min-w-0 opacity-70">
            <p className="text-[8px] text-emerald-800 font-black uppercase tracking-widest leading-none mb-1">
              Now Reading
            </p>
            <h4 className="text-[11px] font-bold text-slate-800 truncate w-full">
              {current.title}
            </h4>
          </div>

          {/* 中间按钮：固定宽度缩窄，让左右空间更大 */}
          <div className="flex items-center gap-4 sm:gap-10 shrink-0">
            <button onClick={prev} className="text-slate-400 hover:text-emerald-600 transition-colors">
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button 
              onClick={() => isPlaying ? pause() : play()}
              className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
            </button>

            <button onClick={next} className="text-slate-400 hover:text-emerald-600 transition-colors">
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          {/* 右侧功能区 */}
          <div className="flex-1 flex justify-end items-center gap-3 shrink-0">
            <button
              onClick={() => toggleLyrics()}
              className={`p-2 rounded-xl transition-all ${
                showLyrics 
                ? "text-emerald-700 bg-white/60 shadow-sm" 
                : "text-slate-500 hover:bg-white/40"
              }`}
            >
              <BookOpenText size={18} />
            </button>

            <div className="hidden sm:flex items-center bg-white/40 px-2 py-1 rounded-lg border border-white/50">
              <select
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="bg-transparent border-none text-slate-700 text-[10px] font-bold outline-none cursor-pointer"
              >
                {[0.8, 1, 1.2, 1.5, 2].map(r => <option key={r} value={r}>{r}x</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}