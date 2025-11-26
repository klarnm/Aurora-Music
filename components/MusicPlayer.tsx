'use client';

import { usePlayerStore } from '@/store/playerStore';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRedo, FaVolumeUp, FaHeart } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    repeat,
    shuffle,
    setIsPlaying,
    setVolume,
    setCurrentTime,
    setDuration,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();

  const { data: session } = useSession();
  const progressRef = useRef<HTMLDivElement>(null);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);

  // Fetch user's liked songs
  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (!session) return;
      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          const likedIds = data.songs.map((s: { _id: { toString: () => string } }) => s._id.toString());
          setLikedSongs(likedIds);
        }
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };
    fetchLikedSongs();
  }, [session]);

  // Check if current song is liked (computed directly)
  const currentIsLiked = currentSong?._id ? likedSongs.includes(currentSong._id.toString()) : false;

  const toggleLike = async () => {
    if (!currentSong?._id || !session) return;

    const songIdStr = currentSong._id.toString();
    const currentlyLiked = likedSongs.includes(songIdStr);

    try {
      if (currentlyLiked) {
        // Unlike
        const response = await fetch(`/api/favorites?songId=${currentSong._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setLikedSongs(prev => prev.filter(id => id !== songIdStr));
        }
      } else {
        // Like
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId: currentSong._id }),
        });
        if (response.ok) {
          setLikedSongs(prev => [...prev, songIdStr]);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {
    if (!currentSong) return;
    
    // Simulate song duration (since we don't have real audio)
    setDuration(currentSong.duration);
    
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(currentTime + 1);
      }, 1000);
    } else if (currentTime >= duration && isPlaying) {
      playNext();
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, currentSong, duration, playNext, setCurrentTime, setDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(percent * duration));
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-28 bg-linear-to-t from-black via-gray-900/95 to-transparent z-50 backdrop-blur-2xl">
      {/* Minimalist design - no top border */}
      
      <div className="h-full px-8 flex items-center justify-center gap-8 relative z-10 max-w-7xl mx-auto">
        {/* Song Info - Absolute Left */}
        <div className="absolute left-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-3xl">🎵</span>
          </div>
          <div className="flex flex-col">
            <h4 className="text-white font-semibold text-base">
              {currentSong.title}
            </h4>
            <p className="text-gray-400 text-sm hover:underline cursor-pointer">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Player Controls - Centered */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-6">
            <button
              onClick={playPrevious}
              className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-110 flex items-center justify-center"
            >
              <FaStepBackward size={16} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl shadow-white/40 hover:shadow-white/60 relative group"
            >
              <div className="absolute inset-0 rounded-full bg-aurora-pink/20 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 blur-xl"></div>
              {isPlaying ? <FaPause size={20} className="text-black relative z-10" /> : <FaPlay size={20} className="text-black ml-1 relative z-10" />}
            </button>

            <button
              onClick={playNext}
              className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-110 flex items-center justify-center"
            >
              <FaStepForward size={16} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-[500px]">
            <span className="text-xs text-white font-medium min-w-12 text-right">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-1.5 bg-gray-700 rounded-full cursor-pointer group relative"
            >
              <div
                className="h-full bg-linear-to-r from-aurora-pink to-aurora-purple rounded-full relative shadow-lg shadow-aurora-pink/50"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>
            <span className="text-xs text-white font-medium min-w-12">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls - Absolute Right */}
        <div className="absolute right-8 flex items-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              shuffle ? 'bg-aurora-mint text-black' : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
            }`}
          >
            <FaRandom size={14} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              repeat !== 'off' ? 'bg-aurora-mint text-black' : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
            }`}
          >
            <FaRedo size={14} />
          </button>

          <button 
            onClick={toggleLike}
            disabled={!session}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              currentIsLiked 
                ? 'bg-aurora-pink text-white hover:bg-aurora-pink/80' 
                : 'bg-white/10 text-gray-400 hover:text-aurora-pink hover:bg-white/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FaHeart size={14} className={currentIsLiked ? 'animate-pulse' : ''} />
          </button>
          
          <div className="flex items-center gap-2 ml-2">
            <FaVolumeUp className="text-gray-400 hover:text-white cursor-pointer" size={16} />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-24 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
