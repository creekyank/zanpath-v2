"use client";

import { useRadioStore } from "@/store/radioStore";
// 引入刚刚安装的图标
import { Play, Pause, SkipBack, SkipForward, Gauge } from "lucide-react";

export default function PlayerUI() {
  const { isPlaying, play, pause, next, prev, queue, currentIndex, rate, setRate } = useRadioStore();
  const current = queue[currentIndex];

  if (!current) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-emerald-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50 p-4 transition-all animate-in slide-in-from-bottom">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        
        {/* 1. 左侧：正在播放的文章标题 */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5 opacity-80">Now Playing</p>
          <p className="text-sm font-bold text-slate-800 truncate leading-tight">
            {current.title}
          </p>
        </div>

        {/* 2. 中间：专业控制按钮 */}
        <div className="flex items-center gap-6 sm:gap-10">
          {/* 上一首 */}
          <button 
            onClick={prev} 
            className="text-slate-400 hover:text-emerald-600 hover:scale-110 active:scale-90 transition-all"
            title="Previous"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>

          {/* 播放/暂停 圆形主按钮 */}
          <button 
            onClick={isPlaying ? pause : play}
            className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} className="ml-1" fill="currentColor" />
            )}
          </button>

          {/* 下一首 */}
          <button 
            onClick={next} 
            className="text-slate-400 hover:text-emerald-600 hover:scale-110 active:scale-90 transition-all"
            title="Next"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
        </div>

        {/* 3. 右侧：语速调节 */}
        <div className="flex-1 flex justify-end items-center gap-2">
          <Gauge size={14} className="text-slate-400 hidden sm:block" />
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="bg-slate-100 border-none text-slate-700 text-xs font-bold rounded-full px-3 py-1.5 outline-none cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-all appearance-none"
          >
            {[0.75, 1, 1.25, 1.5, 2].map(r => (
              <option key={r} value={r}>{r}x</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}