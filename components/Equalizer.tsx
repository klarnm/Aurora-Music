'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEqualizerStore } from '@/store/equalizerStore';
import { FaTimes, FaGripVertical } from 'react-icons/fa';

interface EqualizerProps {
  onClose: () => void;
}

export default function Equalizer({ onClose }: EqualizerProps) {
  const { bands, presets, currentPreset, setBandGain, applyPreset, resetEqualizer } = useEqualizerStore();
  const [visualBars, setVisualBars] = useState<number[]>(Array(10).fill(50));
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisualBars(Array(10).fill(0).map(() => Math.random() * 100));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Initialize position (center-right of screen)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 550,
        y: window.innerHeight / 2 - 300,
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
      }}
      className="w-[500px] bg-linear-to-br from-gray-900/95 via-black/95 to-gray-900/95 rounded-2xl border border-aurora-pink/30 shadow-2xl shadow-aurora-pink/20 backdrop-blur-2xl relative overflow-hidden"
    >
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-0 w-full h-20 bg-linear-to-b from-aurora-pink/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-aurora-mint/10 to-transparent pointer-events-none"></div>
      
      {/* Draggable Header */}
      <div 
        className="flex items-center justify-between mb-6 relative z-10 cursor-move select-none group p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <FaGripVertical className="text-gray-600 group-hover:text-aurora-pink transition-colors" size={16} />
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-aurora-pink via-aurora-purple to-aurora-mint drop-shadow-[0_0_10px_rgba(255,78,136,0.5)]">Ecualizador</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-aurora-pink transition-all hover:scale-110 hover:rotate-90 duration-300 cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Presets */}
      <div className="mb-6 relative z-10 p-6 -mt-2">
        <p className="text-aurora-mint text-sm mb-3 font-semibold">Preajustes</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(presets).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-4 py-2 rounded-full text-sm transition-all hover:scale-105 ${
                currentPreset === preset
                  ? 'bg-linear-to-r from-aurora-pink to-aurora-purple text-white font-semibold shadow-lg shadow-aurora-pink/50 border border-aurora-pink/50'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 border border-white/10 hover:border-aurora-pink/30 backdrop-blur-xl'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Equalizer Sliders */}
      <div className="mb-6 relative z-10">
        <div className="flex items-end justify-between gap-3 h-40 bg-black/30 rounded-xl p-4 border border-white/5">
          {bands.map((band, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
              <div className={`text-xs font-bold transition-colors ${
                band.gain > 0 ? 'text-aurora-pink drop-shadow-[0_0_8px_rgba(255,78,136,0.8)]' : 
                band.gain < 0 ? 'text-aurora-mint drop-shadow-[0_0_8px_rgba(127,219,202,0.8)]' : 
                'text-gray-400'
              }`}>
                {band.gain > 0 ? '+' : ''}{band.gain}
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={band.gain}
                onChange={(e) => setBandGain(index, Number(e.target.value))}
                className="h-24 w-2 appearance-none bg-gray-700/50 rounded-full cursor-pointer group-hover:bg-gray-600 transition-colors
                  [writing-mode:vertical-lr] [direction:rtl]
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-linear-to-br [&::-webkit-slider-thumb]:from-aurora-pink [&::-webkit-slider-thumb]:to-aurora-purple
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-aurora-pink/50
                  hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-transform"
              />
              <span className="text-gray-400 text-xs font-medium group-hover:text-aurora-mint transition-colors">{band.frequency}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visualizer */}
      <div className="pt-4 border-t border-aurora-purple/20 relative z-10">
        <p className="text-aurora-mint text-sm mb-3 font-semibold">Visualizador</p>
        <div className="flex items-end justify-between h-24 gap-1 bg-black/30 rounded-xl p-3 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-aurora-pink/5 to-transparent pointer-events-none"></div>
          {visualBars.map((height, index) => (
            <motion.div
              key={index}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.2 }}
              className="flex-1 bg-linear-to-t from-aurora-pink via-aurora-purple to-aurora-mint rounded-t shadow-lg relative z-10"
              style={{ 
                minHeight: '10%',
                boxShadow: `0 0 ${height/5}px rgba(255, 78, 136, 0.8)`
              }}
            />
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={resetEqualizer}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Restablecer
        </button>
      </div>
    </motion.div>
  );
}
