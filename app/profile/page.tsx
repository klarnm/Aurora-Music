'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import MusicPlayer from '@/components/MusicPlayer';
import { FaUser, FaMusic, FaHeart, FaListUl, FaClock, FaEnvelope, FaCalendar } from 'react-icons/fa';

interface UserStats {
  playlistsCount: number;
  likedSongsCount: number;
  totalListeningTime: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    playlistsCount: 0,
    likedSongsCount: 0,
    totalListeningTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserStats();
    }
  }, [status, router]);

  const fetchUserStats = async () => {
    try {
      // Fetch playlists count
      const playlistsRes = await fetch('/api/playlists');
      const playlistsData = await playlistsRes.json();
      
      // Fetch liked songs count
      const favoritesRes = await fetch('/api/favorites');
      const favoritesData = await favoritesRes.json();

      setStats({
        playlistsCount: playlistsData.playlists?.length || 0,
        likedSongsCount: favoritesData.songs?.length || 0,
        totalListeningTime: Math.floor(Math.random() * 1000) + 100, // Mock data por ahora
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${Math.round(hours)} h`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-aurora-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white pb-32 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        {/* Header with Profile Info */}
        <div className="relative mb-12 rounded-3xl overflow-hidden bg-linear-to-br from-aurora-pink/10 via-purple-900/20 to-blue-900/10 border border-white/10 backdrop-blur-xl">
          <div className="p-12">
            <div className="flex items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-linear-to-br from-aurora-pink via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-aurora-pink/50">
                  <FaUser className="text-7xl text-white/90" />
                </div>
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-aurora-pink/20 to-purple-600/20 blur-3xl -z-10" />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <span className="inline-block px-4 py-1.5 rounded-full bg-aurora-pink/20 text-aurora-pink font-semibold text-sm border border-aurora-pink/50 mb-4">
                  Perfil
                </span>
                <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  {session.user.name || 'Usuario'}
                </h1>
                
                <div className="flex flex-col gap-2 text-gray-300">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-aurora-pink" />
                    <span>{session.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-purple-400" />
                    <span>Miembro desde {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Playlists */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-aurora-pink/30 to-purple-600/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FaListUl className="text-2xl text-aurora-pink" />
            </div>
            <p className="text-4xl font-bold mb-2">{stats.playlistsCount}</p>
            <p className="text-gray-400 text-sm">Playlists creadas</p>
          </div>

          {/* Liked Songs */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-pink-500/30 to-rose-600/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FaHeart className="text-2xl text-pink-400" />
            </div>
            <p className="text-4xl font-bold mb-2">{stats.likedSongsCount}</p>
            <p className="text-gray-400 text-sm">Canciones favoritas</p>
          </div>

          {/* Listening Time */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500/30 to-cyan-600/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FaClock className="text-2xl text-blue-400" />
            </div>
            <p className="text-4xl font-bold mb-2">{formatTime(stats.totalListeningTime)}</p>
            <p className="text-gray-400 text-sm">Tiempo de escucha</p>
          </div>

          {/* Total Songs */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-green-500/30 to-emerald-600/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FaMusic className="text-2xl text-green-400" />
            </div>
            <p className="text-4xl font-bold mb-2">{stats.playlistsCount + stats.likedSongsCount}</p>
            <p className="text-gray-400 text-sm">Total en biblioteca</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-2xl font-bold">Detalles de la cuenta</h2>
          </div>
          
          <div className="divide-y divide-white/5">
            <div className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Nombre de usuario</p>
                  <p className="text-gray-400 text-sm">{session.user.name || 'Sin nombre'}</p>
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-sm transition-all"
                >
                  Editar
                </button>
              </div>
            </div>

            <div className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Correo electrónico</p>
                  <p className="text-gray-400 text-sm">{session.user.email}</p>
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-sm transition-all"
                >
                  Editar
                </button>
              </div>
            </div>

            <div className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Contraseña</p>
                  <p className="text-gray-400 text-sm">••••••••••</p>
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-sm transition-all"
                >
                  Cambiar
                </button>
              </div>
            </div>

            <div className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Fecha de registro</p>
                  <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={() => router.push('/settings')}
            className="px-8 py-3 rounded-xl bg-linear-to-r from-aurora-pink to-purple-600 font-bold hover:shadow-[0_0_30px_rgba(255,78,136,0.5)] transition-all flex items-center gap-2"
          >
            Ir a Configuración
          </button>
          <button
            onClick={() => router.push('/library')}
            className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all flex items-center gap-2"
          >
            Ver mi biblioteca
          </button>
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
}
