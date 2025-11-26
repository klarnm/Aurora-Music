'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Song } from '@/types/models';
import { usePlayerStore } from '@/store/playerStore';
import MusicPlayer from '@/components/MusicPlayer';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { FaPlay, FaHeart } from 'react-icons/fa';

export default function LikedSongsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentSong, setQueue, setIsPlaying, currentSong } = usePlayerStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchLikedSongs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const fetchLikedSongs = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setLikedSongs(data.songs);
        setQueue(data.songs);
      }
    } catch (error) {
      console.error('Error fetching liked songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song: Song, index: number) => {
    setCurrentSong(song);
    setIsPlaying(true);
    // Set queue starting from clicked song
    const newQueue = [...likedSongs.slice(index), ...likedSongs.slice(0, index)];
    setQueue(newQueue);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="aurora-gradient w-20 h-20 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen flex bg-black overflow-hidden relative">
      <AnimatedBackground />
      
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto pb-32 relative">
          {/* Hero Section with Gradient Background */}
          <div className="relative h-[450px] overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-900/80 via-pink-900/60 to-black"></div>
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent"></div>
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-aurora-pink/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-end p-12">
              <div className="flex items-end gap-8 w-full">
                {/* Album Art */}
                <div className="relative group">
                  <div className="w-64 h-64 rounded-3xl bg-linear-to-br from-pink-600 via-purple-600 to-orange-600 flex items-center justify-center shadow-2xl shadow-pink-500/50 transform transition-transform group-hover:scale-105">
                    <FaHeart className="text-white text-9xl drop-shadow-2xl" />
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-pink-500/30 blur-2xl -z-10 group-hover:bg-pink-500/50 transition-all"></div>
                </div>
                
                {/* Info */}
                <div className="flex-1 pb-4">
                  <p className="text-sm font-bold text-aurora-mint uppercase tracking-[0.3em] mb-3 drop-shadow-lg">Playlist Personal</p>
                  <h1 className="text-7xl font-black text-white mb-6 drop-shadow-2xl leading-tight">
                    Canciones que<br/>te gustan
                  </h1>
                  <div className="flex items-center gap-4 text-white/90 text-lg">
                    <div className="w-10 h-10 rounded-full bg-aurora-pink flex items-center justify-center font-bold shadow-lg">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold">{session.user?.name}</span>
                    <span className="text-white/40">•</span>
                    <span className="font-semibold">{likedSongs.length} canciones favoritas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Songs Section */}
          <div className="bg-linear-to-b from-black to-gray-900/50 px-12 py-8">
            {/* Play Button & Controls */}
            {likedSongs.length > 0 && (
              <div className="mb-10 flex items-center gap-6">
                <button
                  onClick={() => handlePlaySong(likedSongs[0], 0)}
                  className="w-20 h-20 rounded-full bg-linear-to-br from-aurora-pink to-pink-600 hover:from-pink-500 hover:to-aurora-pink flex items-center justify-center hover:scale-110 transition-all shadow-2xl hover:shadow-aurora-pink/80 group"
                >
                  <FaPlay className="text-white ml-1 group-hover:scale-110 transition-transform" size={28} />
                </button>
                <div className="flex items-center gap-4">
                  <button className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="19" cy="12" r="1"/>
                      <circle cx="5" cy="12" r="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Songs Grid/List */}
            {likedSongs.length === 0 ? (
              <div className="text-center py-32">
                <div className="relative inline-block mb-6">
                  <FaHeart className="text-8xl text-gray-700 drop-shadow-2xl" />
                  <div className="absolute inset-0 blur-2xl bg-pink-500/20"></div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Tu colección está vacía
                </h2>
                <p className="text-gray-400 text-lg">
                  Descubre música increíble y guarda tus favoritas aquí
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Songs */}
                {likedSongs.map((song, index) => {
                  const isPlaying = currentSong?._id?.toString() === song._id?.toString();
                  
                  return (
                    <div
                      key={song._id?.toString()}
                      onClick={() => handlePlaySong(song, index)}
                      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        isPlaying
                          ? 'bg-linear-to-r from-aurora-pink/30 via-purple-600/20 to-transparent scale-[1.02] shadow-xl shadow-aurora-pink/20'
                          : 'hover:bg-white/5 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-linear-to-r from-aurora-pink/0 via-aurora-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="relative flex items-center gap-6 p-5">
                        {/* Album Art + Number */}
                        <div className="relative flex items-center gap-5">
                          {/* Number */}
                          <div className="w-12 text-center">
                            {isPlaying ? (
                              <div className="flex gap-1 items-center justify-center">
                                <div className="w-1 h-5 bg-aurora-pink rounded-full animate-pulse"></div>
                                <div className="w-1 h-4 bg-aurora-pink rounded-full animate-pulse delay-75"></div>
                                <div className="w-1 h-5 bg-aurora-pink rounded-full animate-pulse delay-150"></div>
                              </div>
                            ) : (
                              <>
                                <span className="text-gray-400 font-bold text-lg group-hover:hidden">
                                  {index + 1}
                                </span>
                                <div className="hidden group-hover:flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-aurora-pink/20 flex items-center justify-center">
                                    <FaPlay className="text-aurora-pink ml-0.5" size={16} />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Album Art */}
                          <div className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 ${
                            isPlaying ? 'ring-2 ring-aurora-pink shadow-lg shadow-aurora-pink/50' : ''
                          }`}>
                            <div className="w-full h-full bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
                              <span className="text-2xl">🎵</span>
                            </div>
                            {isPlaying && (
                              <div className="absolute inset-0 bg-aurora-pink/20 animate-pulse"></div>
                            )}
                          </div>
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-bold truncate mb-1 transition-colors ${
                            isPlaying ? 'text-aurora-pink' : 'text-white group-hover:text-aurora-pink'
                          }`}>
                            {song.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                            <span className="text-gray-600">•</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-aurora-mint border border-aurora-mint/20">
                              {song.genre}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </button>
                          
                          {/* Duration */}
                          <span className="text-gray-400 font-semibold text-sm w-16 text-right">
                            {formatDuration(song.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <MusicPlayer />
      </div>
    </div>
  );
}
