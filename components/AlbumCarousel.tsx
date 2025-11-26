'use client';

import { Song } from '@/types/models';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface AlbumCarouselProps {
  songs: Song[];
  onPlay: (song: Song) => void;
}

export default function AlbumCarousel({ songs, onPlay }: AlbumCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const getVisibleSongs = () => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + songs.length) % songs.length;
      visible.push({ song: songs[index], offset: i });
    }
    return visible;
  };

  return (
    <div className="relative h-[400px] flex items-center justify-center perspective-1000">
      {/* Carousel Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {getVisibleSongs().map(({ song, offset }) => {
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);
            
            return (
              <motion.div
                key={`${song._id?.toString()}-${offset}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  x: offset * 280,
                  z: -absOffset * 200,
                  scale: isCenter ? 1 : 0.7 - absOffset * 0.15,
                  opacity: absOffset > 1 ? 0.3 : 1,
                  rotateY: offset * 15,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`absolute cursor-pointer ${isCenter ? 'z-30' : absOffset === 1 ? 'z-20' : 'z-10'}`}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => isCenter && onPlay(song)}
              >
                <div className={`w-64 h-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                  isCenter ? 'shadow-aurora-pink/50' : 'shadow-black/50'
                } group relative`}>
                  {/* Album Cover */}
                  <div className="w-full h-full bg-linear-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent"></div>
                    <span className="text-8xl relative z-10">🎵</span>
                    
                    {/* Overlay */}
                    {isCenter && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="w-16 h-16 rounded-full bg-aurora-pink flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                          <FaPlay className="text-white ml-1" size={24} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Song Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black via-black/90 to-transparent">
                    <h3 className="text-white font-bold text-lg truncate">{song.title}</h3>
                    <p className="text-gray-300 text-sm truncate">{song.artist}</p>
                    <p className="text-aurora-mint text-xs mt-1">{song.genre}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition-all hover:scale-110 flex items-center justify-center border border-white/20"
      >
        <FaChevronLeft size={20} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition-all hover:scale-110 flex items-center justify-center border border-white/20"
      >
        <FaChevronRight size={20} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {songs.slice(0, 10).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-aurora-pink w-8'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
