import { create } from 'zustand';
import { Song } from '@/types/models';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Song[];
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  showEqualizer: boolean;
  
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleEqualizer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  queue: [],
  shuffle: false,
  repeat: 'off',
  showEqualizer: false,

  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setQueue: (songs) => set({ queue: songs }),
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleRepeat: () =>
    set((state) => ({
      repeat:
        state.repeat === 'off'
          ? 'all'
          : state.repeat === 'all'
          ? 'one'
          : 'off',
    })),
  playNext: () => {
    const { queue, currentSong, repeat, shuffle } = get();
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex((s) => s._id === currentSong._id);
    let nextIndex = currentIndex + 1;

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      nextIndex = repeat === 'all' ? 0 : currentIndex;
    }

    set({ currentSong: queue[nextIndex], currentTime: 0 });
  },
  playPrevious: () => {
    const { queue, currentSong } = get();
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex((s) => s._id === currentSong._id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;

    set({ currentSong: queue[prevIndex], currentTime: 0 });
  },
  toggleEqualizer: () => set((state) => ({ showEqualizer: !state.showEqualizer })),
}));
