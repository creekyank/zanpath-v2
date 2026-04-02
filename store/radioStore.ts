import { create } from "zustand";

export interface Article {
  title: string;
  content: any[];
  slug: string;
  module: string;
}

type Mode = "sequential" | "shuffle";

interface RadioState {
  isPlaying: boolean;
  currentIndex: number;
  queue: Article[];
  mode: Mode;
  locale: string;
  rate: number;

  setQueue: (q: Article[], mode: Mode, locale: string) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setRate: (r: number) => void;
}

export const useRadioStore = create<RadioState>((set, get) => ({
  isPlaying: false,
  currentIndex: 0,
  queue: [],
  mode: "sequential",
  locale: "en",
  rate: 1,

  setQueue: (q, mode, locale) => {
    const currentQueue = get().queue;
    // 检查新队列是否和当前队列一样（比较 slug 列表）
    const isSame = JSON.stringify(currentQueue.map(a => a.slug)) === JSON.stringify(q.map(a => a.slug));
    
    if (isSame) {
      // 如果一样，只确保它在播放，不重置进度
      set({ isPlaying: true });
      return;
    }

    const list = mode === "shuffle" ? [...q].sort(() => Math.random() - 0.5) : q;
    set({ 
      queue: list, 
      currentIndex: 0, 
      mode, 
      locale, 
      isPlaying: true 
    });
  },

  play: () => {
    // 如果系统引擎处于暂停状态，恢复它
    if (typeof window !== "undefined" && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    set({ isPlaying: true });
  },

  pause: () => {
    // 告诉系统引擎暂停
    if (typeof window !== "undefined") {
      window.speechSynthesis.pause();
    }
    set({ isPlaying: false });
  },

  next: () => {
    const { currentIndex, queue } = get();
    if (currentIndex < queue.length - 1) {
      set({ currentIndex: currentIndex + 1, isPlaying: true });
    } else {
      // 播完了，重置并停止
      set({ isPlaying: false, currentIndex: 0 });
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, isPlaying: true });
    }
  },

  setRate: (r) => {
    set({ rate: r });
    // 注意：语速改变时，RadioPlayer.tsx 会因为依赖 [rate] 自动触发 cancel 和重新播放
  },
}));