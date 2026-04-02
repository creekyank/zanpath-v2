"use client";

import { useEffect, useRef } from "react";
import { useRadioStore } from "@/store/radioStore";
import { extractPlayableText, saveProgress, loadProgress } from "@/lib/tts";

export default function RadioPlayer() {
  const { isPlaying, queue, currentIndex, next, locale, rate, pause, play } = useRadioStore();
  const current = queue[currentIndex];
  
  const keepAliveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTaskRef = useRef<string>("");
  const chunkIndexRef = useRef<number>(0);
  const chunksRef = useRef<string[]>([]);
  const retryCountRef = useRef<number>(0);

  // --- 核心优化 1：配置 Media Session (手机锁屏控制) ---
  const updateMediaSession = () => {
    if ("mediaSession" in navigator && current) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: "Zanpath Radio",
        album: "Wisdom Station",
        artwork: [
          { src: "/logo.png", sizes: "512x512", type: "image/png" }
        ]
      });

      // 允许用户在锁屏界面操作
      navigator.mediaSession.setActionHandler("play", () => play());
      navigator.mediaSession.setActionHandler("pause", () => pause());
      navigator.mediaSession.setActionHandler("nexttrack", () => next());
      // 停止时清理
      navigator.mediaSession.setActionHandler("stop", () => {
        pause();
        speechSynthesis.cancel();
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return;
    if (!current) return;

    if (!isPlaying) {
      speechSynthesis.pause();
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      return;
    }

    const currentTaskIdentifier = `${current.slug}-${rate}-${locale}`;
    
    if (speechSynthesis.paused && lastTaskRef.current === currentTaskIdentifier) {
      speechSynthesis.resume();
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      return;
    }

    if (lastTaskRef.current !== currentTaskIdentifier) {
      speechSynthesis.cancel();
      if (keepAliveTimer.current) clearTimeout(keepAliveTimer.current);

      const fullText = extractPlayableText(current.content);
      const startIndex = loadProgress(current.slug);
      
      const rawChunks = fullText.slice(startIndex)
        .match(/[^。！？；.!?]+[。！？；.!?]*/g)
        ?.map(s => s.trim())
        .filter(s => s.length > 0) || [];
      
      chunksRef.current = rawChunks.length > 0 ? rawChunks : [fullText.slice(startIndex)];
      chunkIndexRef.current = 0;
      retryCountRef.current = 0;
      lastTaskRef.current = currentTaskIdentifier;

      // 更新锁屏信息
      updateMediaSession();
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";

      const playNextChunk = () => {
        if (!useRadioStore.getState().isPlaying) return;

        const idx = chunkIndexRef.current;
        const total = chunksRef.current.length;

        if (idx >= total) {
          saveProgress(current.slug, 0);
          lastTaskRef.current = "";
          next();
          return;
        }

        const utter = new SpeechSynthesisUtterance(chunksRef.current[idx]);
        utter.lang = locale === "es" ? "es-ES" : "en-US";
        utter.rate = rate;

        utter.onend = () => {
          chunkIndexRef.current++;
          window.speechSynthesis.resume(); 
          setTimeout(playNextChunk, 250); 
        };

        utter.onerror = (e) => {
          if (e.error === 'interrupted') return;
          if (retryCountRef.current < 3) {
            retryCountRef.current++;
            setTimeout(playNextChunk, 1000);
          } else {
            chunkIndexRef.current++;
            retryCountRef.current = 0;
            setTimeout(playNextChunk, 500);
          }
        };

        window.speechSynthesis.resume();
        speechSynthesis.speak(utter);
      };

      playNextChunk();

      // --- 核心优化 2：增强型 Keep-Alive (针对手机后台) ---
      const keepAlive = () => {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
          // 很多浏览器检测到“静默”会杀掉进程，频繁 resume 能告诉系统页面还在活动
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
        keepAliveTimer.current = setTimeout(keepAlive, 10000); // 缩短到 10 秒一次更安全
      };
      keepAlive();
    }

    return () => {
      if (keepAliveTimer.current) clearTimeout(keepAliveTimer.current);
    };
  }, [isPlaying, currentIndex, rate, current?.slug, locale, next]);

  return null;
}