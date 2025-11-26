'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Song } from '@/types/models';
import { usePlayerStore } from '@/store/playerStore';
import MusicPlayer from '@/components/MusicPlayer';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import PlaylistCard from '@/components/PlaylistCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { FaSearch, FaPlay, FaMusic } from 'react-icons/fa';

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentSong, setQueue, setIsPlaying } = usePlayerStore();

  // Artistas populares (simulados)
  const popularArtists = [
    { name: 'Nirvana', genre: 'Grunge', color: 'from-gray-500 to-gray-800' },
    { name: 'Queen', genre: 'Rock', color: 'from-yellow-500 to-red-600' },
    { name: 'The Beatles', genre: 'Rock clásico', color: 'from-blue-500 to-purple-600' },
    { name: 'Michael Jackson', genre: 'Pop', color: 'from-pink-500 to-purple-700' },
    { name: 'Led Zeppelin', genre: 'Rock', color: 'from-orange-500 to-red-700' },
    { name: 'Pink Floyd', genre: 'Rock progresivo', color: 'from-indigo-500 to-pink-600' },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchAllSongs();
  }, []);

  const fetchAllSongs = async () => {
    try {
      const res = await fetch('/api/songs?limit=100');
      const data = await res.json();
      setAllSongs(data.songs);
      setQueue(data.songs);
      
      // Simular trending (últimas 6 canciones con más plays/likes)
      const trending = [...data.songs]
        .sort((a, b) => (b.plays || 0) + (b.likes || 0) - ((a.plays || 0) + (a.likes || 0)))
        .slice(0, 6);
      setTrendingSongs(trending);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/songs?search=${encodeURIComponent(query)}&limit=50`);
      const data = await res.json();
      setSearchResults(data.songs);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const genres = ['Rock', 'Pop', 'Jazz', 'Hip Hop', 'Electronic', 'Classical', 'Metal', 'Blues'];

  if (status === 'loading') {
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
          <div className="px-12 py-8">
            {/* Hero Search Section */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-aurora-mint to-blue-600 flex items-center justify-center shadow-2xl shadow-aurora-mint/50">
                  <FaSearch className="text-white text-2xl" />
                </div>
                <h1 className="text-6xl font-black text-white drop-shadow-2xl">Buscar</h1>
              </div>
              
              {/* Search Bar */}
              <div className="max-w-3xl">
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-aurora-pink/50 to-aurora-mint/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-focus-within:opacity-100"></div>
                  <div className="relative flex items-center">
                    <FaSearch className="absolute left-6 text-gray-400 group-focus-within:text-aurora-pink transition-colors z-10" size={24} />
                    <input
                      type="text"
                      placeholder="¿Qué quieres escuchar?"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full h-20 pl-16 pr-6 rounded-3xl bg-white/10 backdrop-blur-xl text-white text-xl placeholder-gray-400 focus:outline-none border-2 border-white/10 focus:border-aurora-pink/50 transition-all shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-black text-white">
                    {loading ? 'Buscando...' : 'Resultados'}
                  </h2>
                  {searchResults.length > 0 && (
                    <span className="px-6 py-3 bg-aurora-pink/20 rounded-full text-aurora-pink font-bold border border-aurora-pink/30">
                      {searchResults.length} encontradas
                    </span>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((song, index) => (
                      <button
                        key={song._id?.toString()}
                        onClick={() => {
                          setCurrentSong(song);
                          setIsPlaying(true);
                        }}
                        className="w-full group relative rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:scale-[1.01]"
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-aurora-pink/0 via-aurora-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative flex items-center gap-6 p-5">
                          {/* Number & Album Art */}
                          <div className="flex items-center gap-5">
                            <span className="text-gray-400 font-bold text-xl w-8 text-right group-hover:hidden">
                              {index + 1}
                            </span>
                            <div className="hidden group-hover:flex items-center justify-center w-8">
                              <div className="w-12 h-12 rounded-full bg-aurora-pink flex items-center justify-center">
                                <FaPlay className="text-white ml-0.5" size={16} />
                              </div>
                            </div>

                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg">
                              <div className="w-full h-full bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
                                <FaMusic className="text-white text-2xl" />
                              </div>
                            </div>
                          </div>

                          {/* Song Info */}
                          <div className="flex-1 text-left min-w-0">
                            <h3 className="text-xl font-bold text-white group-hover:text-aurora-pink transition-colors truncate mb-1">
                              {song.title}
                            </h3>
                            <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                          </div>

                          {/* Genre Badge */}
                          <span className="px-4 py-2 rounded-full bg-white/5 text-sm font-semibold text-aurora-mint border border-aurora-mint/20">
                            {song.genre}
                          </span>

                          {/* Duration */}
                          <span className="text-gray-400 font-semibold text-sm w-16 text-right">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : !loading ? (
                  <div className="text-center py-20">
                    <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <FaSearch className="text-gray-600 text-5xl" />
                    </div>
                    <p className="text-gray-400 text-xl">No se encontraron resultados para "{searchQuery}"</p>
                  </div>
                ) : null}
              </section>
            )}

            {/* Trending Songs */}
            {!searchQuery && trendingSongs.length > 0 && (
              <section className="mb-16">
                <div className="mb-8">
                  <h2 className="text-4xl font-black text-white mb-3">Tendencias</h2>
                  <p className="text-gray-400 text-lg">Las más escuchadas del momento</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingSongs.map((song, index) => (
                    <button
                      key={song._id?.toString()}
                      onClick={() => {
                        setCurrentSong(song);
                        setIsPlaying(true);
                      }}
                      className="group relative rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-aurora-pink/30"
                    >
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-linear-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20"></div>
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      <div className="relative p-6 flex items-center gap-5">
                        {/* Rank number */}
                        <div className="w-12 h-12 rounded-xl bg-aurora-pink flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-white font-black text-xl">{index + 1}</span>
                        </div>

                        {/* Album art */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-xl">
                          <div className="w-full h-full bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
                            <FaMusic className="text-white text-xl" />
                          </div>
                        </div>

                        {/* Song info */}
                        <div className="flex-1 text-left min-w-0">
                          <h3 className="text-white font-bold text-lg truncate mb-1 group-hover:text-aurora-pink transition-colors">
                            {song.title}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                        </div>

                        {/* Play button */}
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <FaPlay className="text-white ml-0.5" size={18} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Artists */}
            {!searchQuery && (
              <section className="mb-16">
                <div className="mb-8">
                  <h2 className="text-4xl font-black text-white mb-3">Artistas populares</h2>
                  <p className="text-gray-400 text-lg">Los más escuchados de todos los tiempos</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {popularArtists.map((artist, index) => (
                    <button
                      key={artist.name}
                      onClick={() => handleSearch(artist.name)}
                      className="group relative"
                    >
                      <div className="relative mb-4">
                        {/* Glow effect */}
                        <div className={`absolute inset-0 bg-linear-to-br ${artist.color} rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-300`}></div>
                        
                        {/* Avatar circle */}
                        <div className={`relative w-full aspect-square rounded-full bg-linear-to-br ${artist.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                          {/* Pattern overlay */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]"></div>
                          </div>
                          
                          {/* Letter initial */}
                          <span className="relative text-white font-black text-5xl drop-shadow-2xl">
                            {artist.name.charAt(0)}
                          </span>
                        </div>
                      </div>

                      {/* Artist info */}
                      <div className="text-center">
                        <h3 className="text-white font-bold text-base mb-1 truncate group-hover:text-aurora-pink transition-colors">
                          {artist.name}
                        </h3>
                        <p className="text-gray-400 text-xs truncate">{artist.genre}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Browse Categories */}
            {!searchQuery && (
              <>
                <div className="mb-8">
                  <h2 className="text-4xl font-black text-white mb-3">Explorar géneros</h2>
                  <p className="text-gray-400 text-lg">Descubre música por categorías</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {genres.map((genre, index) => {
                    const colors = [
                      { bg: 'from-pink-500 to-rose-700', shadow: 'pink' },
                      { bg: 'from-blue-500 to-indigo-700', shadow: 'blue' },
                      { bg: 'from-emerald-500 to-teal-700', shadow: 'emerald' },
                      { bg: 'from-purple-500 to-violet-700', shadow: 'purple' },
                      { bg: 'from-orange-500 to-red-700', shadow: 'orange' },
                      { bg: 'from-red-500 to-pink-700', shadow: 'red' },
                      { bg: 'from-indigo-500 to-blue-700', shadow: 'indigo' },
                      { bg: 'from-amber-500 to-orange-700', shadow: 'amber' },
                    ];
                    const color = colors[index];
                    
                    return (
                      <button
                        key={genre}
                        onClick={() => handleSearch(genre)}
                        className={`relative h-48 rounded-3xl bg-linear-to-br ${color.bg} p-6 text-left hover:scale-105 transition-all duration-300 hover:shadow-2xl shadow-${color.shadow}-500/50 overflow-hidden group`}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                        </div>
                        
                        {/* Icon */}
                        <div className="absolute top-4 right-4 w-12 h-12 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaPlay className="text-white ml-0.5" size={16} />
                        </div>
                        
                        {/* Genre name */}
                        <h3 className="relative text-white font-black text-4xl drop-shadow-2xl group-hover:scale-110 transition-transform origin-left">
                          {genre}
                        </h3>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>

        <MusicPlayer />
      </div>
    </div>
  );
}
