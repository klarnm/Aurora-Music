'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Song } from '@/types/models';
import MusicPlayer from '@/components/MusicPlayer';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { FaCheck, FaMusic, FaPlus, FaSearch } from 'react-icons/fa';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function CreatePlaylistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/songs?limit=100');
      const data = await res.json();
      setSongs(data.songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const toggleSong = (songId: string) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else {
      newSelected.add(songId);
    }
    setSelectedSongs(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la playlist');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          songs: Array.from(selectedSongs),
        }),
      });

      if (res.ok) {
        router.push('/library');
      } else {
        alert('Error al crear la playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Error al crear la playlist');
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Hero Header */}
          <div className="relative overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 bg-linear-to-br from-purple-900/40 via-pink-900/30 to-transparent"></div>
            <div className="relative px-12 py-16">
              <div className="flex items-center gap-6 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-aurora-pink to-purple-600 flex items-center justify-center shadow-2xl shadow-aurora-pink/50">
                  <FaMusic className="text-white text-3xl" />
                </div>
                <div>
                  <p className="text-aurora-mint text-sm font-bold uppercase tracking-[0.3em] mb-2">Nueva Colección</p>
                  <h1 className="text-6xl font-black text-white drop-shadow-2xl">
                    Crear Playlist
                  </h1>
                </div>
              </div>
              <p className="text-white/60 text-lg max-w-2xl">
                Crea una colección personalizada de tus canciones favoritas
              </p>
            </div>
          </div>

          <div className="px-12 py-8">
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
              {/* Playlist Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Name Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-aurora-pink/50 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-aurora-pink/20 flex items-center justify-center">
                        <FaMusic className="text-aurora-pink" size={20} />
                      </div>
                      <label className="text-white font-bold text-lg">
                        Nombre de la playlist
                      </label>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mi playlist genial"
                      className="w-full px-6 py-4 bg-black/40 text-white rounded-2xl border-2 border-white/10 focus:outline-none focus:border-aurora-pink placeholder-gray-500 text-lg font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Description Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <label className="text-white font-bold text-lg">
                        Descripción (opcional)
                      </label>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe tu playlist..."
                      rows={3}
                      className="w-full px-6 py-4 bg-black/40 text-white rounded-2xl border-2 border-white/10 focus:outline-none focus:border-purple-500 placeholder-gray-500 font-medium resize-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Songs Selection Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-aurora-pink/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                  {/* Search Bar */}
                  <div className="mb-8">
                    <div className="relative group">
                      <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-aurora-pink transition-colors" size={20} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar canciones por título o artista..."
                        className="w-full pl-16 pr-6 py-5 bg-black/40 text-white rounded-2xl border-2 border-white/10 focus:outline-none focus:border-aurora-pink placeholder-gray-500 text-lg font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Selected Counter */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="px-6 py-3 bg-linear-to-r from-aurora-pink to-purple-600 rounded-full">
                        <span className="text-white font-bold text-lg">
                          {selectedSongs.size} seleccionadas
                        </span>
                      </div>
                      {selectedSongs.size > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedSongs(new Set())}
                          className="text-gray-400 hover:text-white text-sm font-medium transition-colors underline"
                        >
                          Limpiar selección
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Songs Grid */}
                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {filteredSongs.map((song) => {
                      const isSelected = selectedSongs.has(song._id!.toString());
                      return (
                        <button
                          key={song._id?.toString()}
                          type="button"
                          onClick={() => toggleSong(song._id!.toString())}
                          className={`w-full group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                            isSelected
                              ? 'bg-linear-to-r from-aurora-pink/30 via-purple-600/20 to-transparent scale-[1.02] shadow-xl shadow-aurora-pink/20'
                              : 'bg-white/5 hover:bg-white/10 hover:scale-[1.01]'
                          }`}
                        >
                          <div className="flex items-center gap-5 p-5">
                            {/* Checkbox/Icon */}
                            <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-aurora-pink shadow-lg shadow-aurora-pink/50 scale-110'
                                : 'bg-white/10 group-hover:bg-white/20'
                            }`}>
                              {isSelected ? (
                                <FaCheck className="text-white text-xl" />
                              ) : (
                                <FaPlus className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                              )}
                            </div>

                            {/* Song Info */}
                            <div className="flex-1 text-left min-w-0">
                              <h3 className={`text-lg font-bold truncate mb-1 transition-colors ${
                                isSelected ? 'text-aurora-pink' : 'text-white group-hover:text-aurora-pink'
                              }`}>
                                {song.title}
                              </h3>
                              <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                            </div>

                            {/* Genre Badge */}
                            <span className="px-4 py-2 rounded-full bg-white/5 text-xs font-semibold text-aurora-mint border border-aurora-mint/20">
                              {song.genre}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-10 py-5 bg-white/10 backdrop-blur-xl text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all border border-white/20 hover:scale-105"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="px-12 py-5 bg-linear-to-r from-aurora-pink to-purple-600 text-white rounded-full font-bold text-lg hover:scale-110 transition-all shadow-2xl hover:shadow-aurora-pink/60 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <FaPlus />
                      Crear Playlist
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        <MusicPlayer />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #FF4E88, #8A2BE2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #E94B8F, #7928CA);
        }
      `}</style>
    </div>
  );
}
