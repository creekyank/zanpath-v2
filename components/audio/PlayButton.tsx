"use client";

import { useRadioStore } from "@/store/radioStore";
import { trackPlay, getRecommended } from "@/lib/recommend";
import { Play, AudioLines } from "lucide-react"; // 使用刚刚安装的图标库

interface PlayButtonProps {
  article: any;      // 当前页面显示的这一篇文章对象
  allArticles: any[]; // 由父组件传进来的全量文章列表
  locale: string;
}

export default function PlayButton({ article, allArticles, locale }: PlayButtonProps) {
  const { setQueue, isPlaying, queue, currentIndex } = useRadioStore();

  // 判断当前播放的是不是正是在看这篇文章
  const isCurrentArticlePlaying = isPlaying && queue[currentIndex]?.slug === article.slug;

  const handlePlay = () => {
    // 1. 记录点击权重
    trackPlay(article.slug);

    // 2. 获取推荐（100篇），排除当前文章
    const recommended = getRecommended(allArticles, article.slug);
    
    // 3. 构建队列：当前文章排第一，后面接推荐
    const fullQueue = [article, ...recommended];

    // 4. 发送到状态管理器并自动开始
    setQueue(fullQueue, "sequential", locale);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handlePlay}
        className={`flex items-center gap-3 px-10 py-4 rounded-full transition-all shadow-xl active:scale-95 ${
          isCurrentArticlePlaying 
          ? "bg-orange-500 text-white animate-pulse shadow-orange-200" 
          : "bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-100"
        }`}
      >
        {/* 动态切换图标 */}
        {isCurrentArticlePlaying ? (
          <AudioLines size={24} className="animate-bounce" />
        ) : (
          <Play size={24} fill="currentColor" />
        )}

        <span className="font-extrabold tracking-widest text-sm sm:text-base">
          {locale === "es" ? "ESCUCHAR AHORA" : "LISTEN NOW"}
        </span>
      </button>

      {/* 提示文案 */}
      <div className="flex flex-col items-center opacity-60">
        <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest">
          {locale === "es" ? "Audio Guía AI" : "AI Audio Guide"}
        </p>
        {isCurrentArticlePlaying && (
          <span className="text-[9px] text-orange-600 font-bold animate-pulse">
             {locale === "es" ? "Reproduciendo..." : "Playing Now..."}
          </span>
        )}
      </div>
    </div>
  );
}