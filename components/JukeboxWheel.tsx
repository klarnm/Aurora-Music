'use client';

import { Playlist, Song } from '@/types/models';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaMusic } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface JukeboxWheelProps {
  playlists: Playlist[];
  likedSongs: Song[];
}

export default function JukeboxWheel({ playlists }: JukeboxWheelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlaylistClick = (playlist: Playlist) => {
    // Always navigate to playlist page
    const playlistId = playlist._id?.toString() || '';
    console.log('Navigating to playlist:', playlistId, playlist.name);
    router.push(`/playlist/${playlistId}`);
  };

  // Filter out invalid playlists and ensure they have required properties
  const validPlaylists = (playlists || []).filter((p): p is Playlist => {
    const isValid = p != null && 
      p._id != null && 
      typeof p.name === 'string' &&
      p.name.trim().length > 0;
    
    if (!isValid) {
      console.warn('Invalid playlist detected:', p);
    }
    
    return isValid;
  });

  const visibleCount = 7;
  const middleIndex = Math.floor(visibleCount / 2);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      setIsScrolling(true);
      
      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Determine scroll direction
      if (e.deltaY > 0) {
        // Scroll down - next playlist
        setCurrentIndex((prev) => (prev + 1) % validPlaylists.length);
      } else {
        // Scroll up - previous playlist
        setCurrentIndex((prev) => (prev - 1 + validPlaylists.length) % validPlaylists.length);
      }

      // Set timeout to stop scrolling animation
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [validPlaylists.length]);

  const getVisiblePlaylists = () => {
    const visible = [];
    for (let i = -middleIndex; i <= middleIndex; i++) {
      const index = (currentIndex + i + validPlaylists.length) % validPlaylists.length;
      const playlist = validPlaylists[index];
      
      // Extra safety check
      if (playlist && playlist._id && playlist.name) {
        visible.push({
          playlist: playlist,
          offset: i,
          index: index
        });
      }
    }
    return visible;
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-pink-600 to-purple-600',
      'from-blue-600 to-cyan-600',
      'from-green-600 to-emerald-600',
      'from-orange-600 to-red-600',
      'from-purple-600 to-pink-600',
      'from-yellow-600 to-orange-600',
      'from-indigo-600 to-purple-600',
      'from-red-600 to-pink-600',
    ];
    return gradients[index % gradients.length];
  };

  if (validPlaylists.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-black/20 rounded-3xl border border-white/10">
        <div className="text-center">
          <FaMusic className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">
            No tienes playlists todavía
          </h3>
          <p className="text-gray-400">
            Crea tu primera playlist para ver la rockola
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[600px] flex items-center justify-center perspective-1000 overflow-hidden rounded-3xl bg-linear-to-br from-black/40 via-gray-900/40 to-black/40 border border-white/10 backdrop-blur-xl"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-linear-to-b from-aurora-pink/5 via-transparent to-aurora-purple/5 pointer-events-none"></div>
      
      {/* Center spotlight */}
      <div className="absolute inset-0 bg-gradient-radial from-aurora-pink/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Jukebox wheel container */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <AnimatePresence mode="popLayout">
          {getVisiblePlaylists().map(({ playlist, offset, index }) => {
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);
            const scale = isCenter ? 1 : 0.85 - absOffset * 0.1;
            const opacity = absOffset > 2 ? 0.3 : 1 - absOffset * 0.2;
            const yPos = offset * 90;
            const zPos = -absOffset * 100;
            const rotateX = offset * 8;

            return (
              <motion.div
                key={`${playlist._id?.toString()}-${offset}`}
                initial={{ opacity: 0, scale: 0.5, y: yPos }}
                animate={{
                  y: yPos,
                  z: zPos,
                  scale: scale,
                  opacity: opacity,
                  rotateX: rotateX,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ 
                  duration: 0.3, 
                  ease: 'easeOut',
                  scale: { duration: 0.25 }
                }}
                className={`absolute cursor-pointer ${
                  isCenter ? 'z-50' : absOffset === 1 ? 'z-40' : absOffset === 2 ? 'z-30' : 'z-20'
                }`}
                style={{ 
                  transformStyle: 'preserve-3d',
                  filter: isCenter ? 'none' : `blur(${absOffset * 1.5}px)`
                }}
                onClick={() => {
                  if (isCenter) {
                    handlePlaylistClick(playlist);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
              >
                <div className={`
                  w-[500px] h-20 rounded-2xl overflow-hidden
                  transition-all duration-300 relative
                  ${isCenter 
                    ? 'shadow-2xl shadow-aurora-pink/50 border-2 border-aurora-pink/50' 
                    : 'shadow-lg shadow-black/50 border border-white/10'
                  }
                  group
                `}>
                  {/* Background */}
                  <div className={`absolute inset-0 bg-linear-to-r ${getGradient(index)}`}>
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center justify-between px-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Vinyl Icon */}
                      <div className={`
                        w-12 h-12 rounded-full bg-black/60 flex items-center justify-center shrink-0 border-2 border-white/20
                        ${isCenter && isScrolling ? 'animate-spin' : ''}
                        transition-all duration-300
                      `}>
                        <div className="w-3 h-3 rounded-full bg-aurora-pink"></div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold truncate transition-all ${
                          isCenter ? 'text-2xl text-white' : 'text-lg text-white/80'
                        }`}>
                          {playlist?.name || 'Playlist sin nombre'}
                        </h3>
                        <p className={`text-sm truncate transition-all ${
                          isCenter ? 'text-gray-300' : 'text-gray-400'
                        }`}>
                          {Array.isArray(playlist?.songs) ? playlist.songs.length : 0} canciones
                        </p>
                      </div>
                    </div>

                    {/* Play button - only visible on center */}
                    {isCenter && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-all shadow-2xl group-hover:shadow-white/50 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaylistClick(playlist);
                        }}
                      >
                        <FaPlay className="text-black ml-1" size={20} />
                      </motion.button>
                    )}
                  </div>

                  {/* Glow effect for center */}
                  {isCenter && (
                    <div className="absolute inset-0 bg-linear-to-r from-aurora-pink/20 to-aurora-purple/20 animate-pulse pointer-events-none"></div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="flex flex-col items-center gap-2 text-gray-400">
          <p className="text-sm font-medium">Usa la rueda del mouse</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-aurora-pink animate-ping"></div>
            <span className="text-xs">{currentIndex + 1} / {validPlaylists.length}</span>
            <div className="w-2 h-2 rounded-full bg-aurora-pink animate-ping"></div>
          </div>
        </div>
      </div>

      {/* Top/Bottom fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-black/80 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/80 to-transparent pointer-events-none"></div>
    </div>
  );
}
