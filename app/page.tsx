'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Song } from '@/types/models';
import { usePlayerStore } from '@/store/playerStore';
import MusicPlayer from '@/components/MusicPlayer';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import PlaylistCard from '@/components/PlaylistCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import AlbumCarousel from '@/components/AlbumCarousel';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentSong, setQueue, setIsPlaying } = usePlayerStore();

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
      setQueue(data.songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar canciones por género para crear "playlists"
  const getGenrePlaylists = () => {
    const genres = new Map<string, Song[]>();
    songs.forEach(song => {
      if (!genres.has(song.genre)) {
        genres.set(song.genre, []);
      }
      genres.get(song.genre)?.push(song);
    });
    return Array.from(genres.entries()).map(([genre, songs]) => ({
      title: genre,
      songs
    }));
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

  const genrePlaylists = getGenrePlaylists();

  return (
    <div className="h-screen flex bg-black overflow-hidden relative">
      <AnimatedBackground />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-linear-to-b from-gray-900 to-black pb-32">
          <div className="p-8">
            {/* Welcome section */}
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-aurora-pink to-aurora-mint mb-12 drop-shadow-[0_0_20px_rgba(255,78,136,0.3)] hover:scale-105 transition-transform duration-300 inline-block cursor-pointer">
              Bienvenido
            </h2>

            {/* Featured Carousel */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-white mb-8">Destacados</h3>
              <AlbumCarousel
                songs={songs.slice(0, 20)}
                onPlay={(song) => {
                  setCurrentSong(song);
                  setIsPlaying(true);
                }}
              />
            </div>

            {/* Quick Access Grid */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-white mb-6">Acceso rápido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.slice(0, 6).map((song) => (
                <button
                  key={song._id?.toString()}
                  onClick={() => {
                    setCurrentSong(song);
                    setIsPlaying(true);
                  }}
                  className="bg-white/10 hover:bg-white/25 rounded-lg flex items-center overflow-hidden group transition-all hover:scale-105 hover:shadow-2xl hover:shadow-aurora-pink/20 border border-white/5 hover:border-aurora-pink/30 backdrop-blur-xl relative"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="w-20 h-20 bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent"></div>
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300 relative z-10">🎵</span>
                  </div>
                  <div className="px-4 flex-1 text-left relative z-10">
                    <p className="text-white font-semibold truncate group-hover:text-aurora-pink transition-colors">{song.title}</p>
                    <p className="text-gray-400 text-sm truncate group-hover:text-aurora-mint/80 transition-colors">{song.artist}</p>
                  </div>
                </button>
              ))}
              </div>
            </div>
            {/* Playlists by Genre */}
            {genrePlaylists.slice(0, 5).map((playlist) => (
              <section key={playlist.title} className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white hover:text-aurora-pink cursor-pointer transition-all hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(255,78,136,0.5)]">
                    {playlist.title}
                  </h2>
                  <button className="px-6 py-2 rounded-full bg-white/5 text-gray-400 hover:text-aurora-mint text-sm font-semibold hover:scale-105 transition-all hover:bg-white/10 border border-white/10">
                    Ver todo
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-6">
                  {playlist.songs.slice(0, 7).map((song) => (
                    <PlaylistCard
                      key={song._id?.toString()}
                      title={song.title}
                      description={`${song.artist} • ${song.genre}`}
                      onClick={() => {
                        setCurrentSong(song);
                        setIsPlaying(true);
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>

        {/* Player */}
        <MusicPlayer />
      </div>
    </div>
  );
}
