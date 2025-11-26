'use client';

import { Song } from '@/types/models';
import { FaPlay } from 'react-icons/fa';

interface PlaylistCardProps {
  title: string;
  description?: string;
  songs?: Song[];
  imageUrl?: string;
  onClick?: () => void;
}

export default function PlaylistCard({ title, description, songs, imageUrl, onClick }: PlaylistCardProps) {
  // Generar color de gradiente basado en el título
  const getGradient = () => {
    const gradients = [
      'from-purple-600 to-blue-600',
      'from-pink-600 to-purple-600',
      'from-green-600 to-blue-600',
      'from-yellow-600 to-orange-600',
      'from-red-600 to-pink-600',
      'from-indigo-600 to-purple-600',
    ];
    const index = title.length % gradients.length;
    return gradients[index];
  };

  return (
    <div
      onClick={onClick}
      className="bg-linear-to-br from-gray-900/60 to-gray-800/40 hover:from-gray-800/80 hover:to-gray-700/60 rounded-2xl p-5 cursor-pointer transition-all group hover:scale-105 hover:shadow-2xl hover:shadow-aurora-pink/30 border border-white/10 hover:border-aurora-pink/50 backdrop-blur-2xl relative overflow-hidden"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative mb-5">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full aspect-square object-cover rounded-xl shadow-2xl group-hover:shadow-aurora-pink/40 transition-all group-hover:scale-105" />
        ) : (
          <div className={`w-full aspect-square rounded-xl bg-linear-to-br ${getGradient()} shadow-2xl group-hover:shadow-aurora-pink/40 transition-all flex items-center justify-center relative overflow-hidden group-hover:scale-105`}>
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-2xl">🎵</span>
          </div>
        )}
        <button className="absolute bottom-3 right-3 w-14 h-14 bg-linear-to-br from-aurora-pink to-aurora-purple rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl hover:scale-110 hover:shadow-aurora-pink/70 border-2 border-white/20">
          <FaPlay className="text-white ml-0.5" size={18} />
        </button>
      </div>
      <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-aurora-pink group-hover:to-aurora-mint transition-all relative z-10">{title}</h3>
      <p className="text-gray-400 text-sm line-clamp-2 group-hover:text-gray-300 transition-colors relative z-10">{description || `${songs?.length || 0} canciones`}</p>
    </div>
  );
}
