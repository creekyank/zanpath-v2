"use client";

import { useEffect, useRef } from "react";
import { useRadioStore } from "@/store/radioStore";
import { extractPlayableText, saveProgress, loadProgress } from "@/lib/tts";

export default function RadioPlayer() {
  const { 
    isPlaying, queue, currentIndex, next, locale, rate, 
    setCurrentChunkIndex, setCurrentChunks 
  } = useRadioStore();
  
  const current = queue[currentIndex];
  const keepAliveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTaskRef = useRef<string>("");
  const chunkIndexRef = useRef<number>(0);
  const chunksRef = useRef<string[]>([]);
  const retryCountRef = useRef<number>(0);

  // 更新 Media Session (锁屏控制)
  const updateMediaSession = () => {
    if ("mediaSession" in navigator && current) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: "Zanpath Radio",
        album: "Wisdom Station",
        artwork: [{ src: "/logo.png", sizes: "512x512", type: "image/png" }]
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return;
    if (!current) return;

    // --- 核心修复：暂停逻辑 ---
    if (!isPlaying) {
      // 某些浏览器 pause() 后 resume() 不起作用，所以这里直接 cancel 任务，
      // 但保留索引，这样下次 play 时会重新 speak 当前句子。
      window.speechSynthesis.cancel(); 
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      return;
    }

    const currentTaskIdentifier = `${current.slug}-${rate}-${locale}`;
    
    // 如果任务没变，且现在是播放状态，但引擎没在说话，尝试启动
    if (lastTaskRef.current === currentTaskIdentifier) {
        if (!window.speechSynthesis.speaking) {
            playNextChunk();
        }
        return;
    }

    // --- 初始化新文章播放 ---
    window.speechSynthesis.cancel();
    if (keepAliveTimer.current) clearTimeout(keepAliveTimer.current);

    const bodyText = extractPlayableText(current.content);
    const fullText = `${current.title}. ${bodyText}`; 
    
    const startIndex = loadProgress(current.slug);
    
    const rawChunks = fullText.slice(startIndex)
      .match(/[^。！？；.!?]+[。！？；.!?]*/g)
      ?.map(s => s.trim())
      .filter(s => s.length > 0) || [];
    
    const finalChunks = rawChunks.length > 0 ? rawChunks : [fullText.slice(startIndex)];
    
    // 把处理好的句子存入 Ref 和 Store
    chunksRef.current = finalChunks;
    setCurrentChunks(finalChunks); 
    
    chunkIndexRef.current = 0;
    setCurrentChunkIndex(0);
    
    retryCountRef.current = 0;
    lastTaskRef.current = currentTaskIdentifier;

    updateMediaSession();
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";

    function playNextChunk() {
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

      utter.onstart = () => {
        setCurrentChunkIndex(idx); // 同步歌词高亮
      };

      utter.onend = () => {
        chunkIndexRef.current++;
        setTimeout(playNextChunk, 200); 
      };

      utter.onerror = (e) => {
        if (e.error === 'interrupted') return;
        console.error("TTS Error:", e);
        setTimeout(playNextChunk, 500);
      };

      window.speechSynthesis.speak(utter);
    }

    playNextChunk();

    // Keep-Alive 策略
    const keepAlive = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
      keepAliveTimer.current = setTimeout(keepAlive, 10000);
    };
    keepAlive();

    return () => {
      if (keepAliveTimer.current) clearTimeout(keepAliveTimer.current);
    };
  }, [isPlaying, currentIndex, rate, current?.slug, locale]);

  return null;
}