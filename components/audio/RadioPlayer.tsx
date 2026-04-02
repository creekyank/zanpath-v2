"use client";

import { useEffect, useRef } from "react";
import { useRadioStore } from "@/store/radioStore";
import { extractPlayableText, saveProgress, loadProgress } from "@/lib/tts";

export default function RadioPlayer() {
  const { isPlaying, queue, currentIndex, next, locale, rate, pause } = useRadioStore();

  const current = queue[currentIndex];
  const keepAliveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. 基本安全检查
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return;
    if (!current) return;

    // 2. 处理暂停逻辑
    if (!isPlaying) {
      speechSynthesis.pause();
      return;
    }

    // 3. 处理从【浏览器原生暂停】中恢复
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      return;
    }

    // 4. 开始新的朗读前，彻底清空之前的任务
    speechSynthesis.cancel();
    if (keepAliveTimer.current) clearTimeout(keepAliveTimer.current);

    // 5. 提取文本并定位进度
    const fullText = extractPlayableText(current.content);
    const startIndex = loadProgress(current.slug);
    const textToPlay = fullText.slice(startIndex);

    if (!textToPlay.trim()) {
      next(); // 如果这段没内容了，跳下一篇
      return;
    }

    const utter = new SpeechSynthesisUtterance(textToPlay);
    utter.lang = locale === "es" ? "es-ES" : "en-US";
    utter.rate = rate;

    // 💡 核心 Hack：防止长文本静音中断
    const keepAlive = () => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        speechSynthesis.resume();
      }
      keepAliveTimer.current = setTimeout(keepAlive, 14000); // 14秒执行一次
    };

    // 记录进度：保存的是在原全文中的绝对索引
    utter.onboundary = (e) => {
      saveProgress(current.slug, startIndex + e.charIndex);
    };

    // 播放结束
    utter.onend = () => {
      if (keepAliveTimer.current) clearTimeout(keepAliveTimer.current);
      saveProgress(current.slug, 0); // 清除该篇进度
      next();
    };

    // 错误处理（如系统杀掉进程）
    utter.onerror = (e) => {
      console.error("TTS Error:", e);
      if (keepAliveTimer.current) clearTimeout(keepAliveTimer.current);
      // 如果是非手动停止导致的错误，可以在这里尝试稍后重启
    };

    speechSynthesis.speak(utter);
    keepAlive();

    // 🎧 MediaSession (锁屏控制)
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: "Zanpath Radio",
      });
    }

    // 清理函数
    return () => {
      if (keepAliveTimer.current) clearTimeout(keepAliveTimer.current);
      // 注意：这里不建议直接 cancel()，否则切换语速时会突变，
      // 但为了防止重叠，切换文章时我们已经在开头 cancel 了。
    };
  }, [isPlaying, currentIndex, rate, current, locale, next]);

  return null;
}