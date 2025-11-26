'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Song, Playlist } from '@/types/models';
import { usePlayerStore } from '@/store/playerStore';
import MusicPlayer from '@/components/MusicPlayer';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import PlaylistCard from '@/components/PlaylistCard';
import JukeboxWheel from '@/components/JukeboxWheel';
import { FaPlus, FaHeart } from 'react-icons/fa';

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentSong, setQueue, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchLibrary();
    }
  }, [status, router]);

  const fetchLibrary = async () => {
    try {
      const [playlistsRes, favoritesRes] = await Promise.all([
        fetch('/api/playlists'),
        fetch('/api/favorites')
      ]);
      
      const playlistsData = await playlistsRes.json();
      const favoritesData = await favoritesRes.json();
      
      const userPlaylists = playlistsData.playlists || [];
      const songs = favoritesData.songs || [];
      
      // Create "Liked Songs" as a virtual playlist
      const likedPlaylist: Playlist = {
        _id: 'liked-songs' as any,
        name: 'Canciones que te gustan',
        description: `${songs.length} canciones`,
        userId: session?.user?.id as any,
        songs: songs.map((s: Song) => s._id) as any,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add liked songs playlist at the beginning
      setPlaylists([likedPlaylist, ...userPlaylists]);
      setLikedSongs(songs);
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = () => {
    router.push('/create-playlist');
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
    <div className="h-screen flex bg-black overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto bg-linear-to-b from-gray-900 to-black">
          <div className="p-8 pb-32">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-aurora-pink to-aurora-mint drop-shadow-[0_0_20px_rgba(255,78,136,0.3)]">Tu Biblioteca</h1>
              <button
                onClick={createPlaylist}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-aurora-pink to-aurora-purple text-white rounded-full font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl hover:shadow-aurora-pink/50"
              >
                <FaPlus size={16} />
                Crear playlist
              </button>
            </div>

            {/* Jukebox Wheel - Main Feature */}
            {playlists.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-8">
                  Rockola de Playlists
                </h2>
                <JukeboxWheel playlists={playlists} likedSongs={likedSongs} />
              </section>
            )}
          </div>
        </main>

        <MusicPlayer />
      </div>
    </div>
  );
}
