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
  
  // --- 歌词/播放状态 ---
  showLyrics: boolean;
  currentChunkIndex: number;
  currentChunks: string[];
  
  // --- 方法 ---
  setQueue: (q: Article[], mode: Mode, locale: string) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setRate: (r: number) => void;
  toggleLyrics: () => void;
  setCurrentChunkIndex: (index: number) => void;
  setCurrentChunks: (chunks: string[]) => void;
}

export const useRadioStore = create<RadioState>((set, get) => ({
  isPlaying: false,
  currentIndex: 0,
  queue: [],
  mode: "sequential",
  locale: "en",
  rate: 1,
  
  showLyrics: false,
  currentChunkIndex: 0,
  currentChunks: [],

  /**
   * 设置播放队列
   * 优化：如果队列相同则仅继续播放；如果不同则重置索引并清空旧歌词
   */
  setQueue: (q, mode, locale) => {
    const currentQueue = get().queue;
    const isSame = JSON.stringify(currentQueue.map(a => a.slug)) === JSON.stringify(q.map(a => a.slug));
    
    if (isSame) {
      set({ isPlaying: true });
      return;
    }

    const list = mode === "shuffle" ? [...q].sort(() => Math.random() - 0.5) : q;
    set({ 
      queue: list, 
      currentIndex: 0, 
      mode, 
      locale, 
      isPlaying: true,
      currentChunkIndex: 0,
      currentChunks: [] // ✨ 清空旧歌词，等待 RadioPlayer 重新生成
    });
  },

  play: () => {
    if (typeof window !== "undefined" && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    set({ isPlaying: true });
  },

  pause: () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.pause();
    }
    set({ isPlaying: false });
  },

  /**
   * 下一首
   * 优化：切换文章瞬间清空进度和歌词数据
   */
  next: () => {
    const { currentIndex, queue } = get();
    if (currentIndex < queue.length - 1) {
      set({ 
        currentIndex: currentIndex + 1, 
        isPlaying: true, 
        currentChunkIndex: 0,
        currentChunks: [] // ✨ 切换时重置歌词
      });
    } else {
      set({ isPlaying: false, currentIndex: 0, currentChunkIndex: 0 });
    }
  },

  /**
   * 上一首
   */
  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ 
        currentIndex: currentIndex - 1, 
        isPlaying: true, 
        currentChunkIndex: 0,
        currentChunks: [] // ✨ 切换时重置歌词
      });
    }
  },

  setRate: (r) => {
    console.log("Store: 语速调整为", r);
    set({ rate: r });
  },
  
  /**
   * 切换歌词显示
   */
  toggleLyrics: () => {
    set((state) => ({ showLyrics: !state.showLyrics }));
  },

  setCurrentChunkIndex: (index) => set({ currentChunkIndex: index }),
  
  /**
   * 接收来自 RadioPlayer 的新歌词块
   */
  setCurrentChunks: (chunks) => {
    console.log("Store: 接收到新歌词，行数:", chunks.length);
    set({ currentChunks: chunks });
  },
}));