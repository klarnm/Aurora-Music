'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Song } from '@/types/models';
import AnimatedBackground from '@/components/AnimatedBackground';
import MusicPlayer from '@/components/MusicPlayer';
import { usePlayerStore } from '@/store/playerStore';
import { FaPlay, FaPause, FaSearch, FaMagic, FaCheck, FaSave } from 'react-icons/fa';

const EMOTIONS = [
  { value: 'Feliz', label: 'Feliz', color: 'from-yellow-400 to-orange-500' },
  { value: 'Triste', label: 'Triste', color: 'from-blue-400 to-indigo-600' },
  { value: 'Energético', label: 'Energético', color: 'from-red-500 to-pink-500' },
  { value: 'Relajado', label: 'Relajado', color: 'from-green-400 to-teal-500' },
  { value: 'Nostálgico', label: 'Nostálgico', color: 'from-purple-400 to-pink-400' },
  { value: 'Motivado', label: 'Motivado', color: 'from-orange-500 to-red-600' },
  { value: 'Melancólico', label: 'Melancólico', color: 'from-gray-400 to-blue-500' },
  { value: 'Romántico', label: 'Romántico', color: 'from-pink-400 to-rose-600' },
];

export default function AIPlaylistPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, setQueue } = usePlayerStore();

  const [step, setStep] = useState<'setup' | 'preview'>('setup');
  
  // Setup state
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [prompt, setPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [selectedSeeds, setSelectedSeeds] = useState<Song[]>([]);
  
  // Preview state
  const [generatedPlaylist, setGeneratedPlaylist] = useState<Song[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allSongs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(allSongs);
    }
  }, [searchQuery, allSongs]);

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs?limit=100');
      const data = await response.json();
      setAllSongs(data.songs || []);
      setFilteredSongs(data.songs || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const toggleSeedSelection = (song: Song) => {
    if (selectedSeeds.find(s => s._id?.toString() === song._id?.toString())) {
      setSelectedSeeds(selectedSeeds.filter(s => s._id?.toString() !== song._id?.toString()));
    } else if (selectedSeeds.length < 5) {
      setSelectedSeeds([...selectedSeeds, song]);
    }
  };

  const generatePlaylist = async () => {
    if (!selectedEmotion || !prompt.trim() || selectedSeeds.length !== 5) {
      alert('Por favor completa todos los campos: emoción, descripción y 5 canciones');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/playlists/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion: selectedEmotion,
          prompt: prompt.trim(),
          seedSongs: selectedSeeds.map(s => s._id?.toString()),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedPlaylist(data.playlist);
        setPlaylistName(`Playlist ${selectedEmotion} - ${new Date().toLocaleDateString()}`);
        setStep('preview');
      } else {
        alert(data.error || 'Error al generar playlist');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar playlist');
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlaylist = async () => {
    const name = playlistName.trim();
    
    if (!name) {
      alert('Por favor ingresa un nombre para la playlist');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          description: `Generada con IA: ${selectedEmotion}. ${prompt}`,
          songs: generatedPlaylist.map(s => s._id?.toString()),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowSaveModal(false);
        router.push(`/playlist/${data.playlistId}`);
      } else {
        alert(data.error || 'Error al guardar playlist');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar playlist');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlay = (song: Song) => {
    if (currentSong?._id?.toString() === song._id?.toString()) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setQueue(generatedPlaylist);
      setIsPlaying(true);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white pb-32 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {step === 'setup' ? (
          <>
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-aurora-pink to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(255,78,136,0.5)]">
                  <FaMagic className="text-3xl" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-aurora-pink via-purple-400 to-aurora-mint bg-clip-text text-transparent">
                Crear Playlist con IA
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Deja que nuestra IA cree la playlist perfecta para tu estado de ánimo
              </p>
            </div>

            {/* Step 1: Emoción */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-aurora-pink/20 flex items-center justify-center text-aurora-pink font-bold">1</span>
                ¿Cómo te sientes?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion.value}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                      selectedEmotion === emotion.value
                        ? 'border-aurora-pink bg-aurora-pink/10 scale-105'
                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:scale-105'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-linear-to-br ${emotion.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative">
                      <p className="font-semibold text-lg">{emotion.label}</p>
                      {selectedEmotion === emotion.value && (
                        <FaCheck className="absolute top-0 right-0 text-aurora-pink" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Prompt */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-aurora-pink/20 flex items-center justify-center text-aurora-pink font-bold">2</span>
                Describe tu estado de ánimo
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Me siento nostálgico, recordando los veranos de mi juventud..."
                className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 focus:border-aurora-pink/50 focus:outline-none resize-none h-32 text-white placeholder-gray-500"
              />
            </div>

            {/* Step 3: Canciones Semilla */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-aurora-pink/20 flex items-center justify-center text-aurora-pink font-bold">3</span>
                Selecciona 5 canciones que te gusten
                <span className="text-sm font-normal text-gray-400">
                  ({selectedSeeds.length}/5)
                </span>
              </h2>

              {/* Selected Seeds */}
              {selectedSeeds.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-3">
                  {selectedSeeds.map((song) => (
                    <div
                      key={song._id?.toString()}
                      className="flex items-center gap-3 px-4 py-2 rounded-full bg-aurora-pink/20 border border-aurora-pink/50"
                    >
                      <span className="text-sm font-medium">{song.title}</span>
                      <button
                        onClick={() => toggleSeedSelection(song)}
                        className="text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar canciones..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-aurora-pink/50 focus:outline-none text-white placeholder-gray-500"
                />
              </div>

              {/* Song List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredSongs.slice(0, 50).map((song) => {
                  const isSelected = selectedSeeds.find(s => s._id?.toString() === song._id?.toString());
                  const canSelect = selectedSeeds.length < 5 || isSelected;

                  return (
                    <button
                      key={song._id?.toString()}
                      onClick={() => canSelect && toggleSeedSelection(song)}
                      disabled={!canSelect}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-aurora-pink/10 border-aurora-pink'
                          : canSelect
                          ? 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                          : 'bg-white/5 border-white/10 opacity-30 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-aurora-pink/30 to-purple-600/30 flex items-center justify-center shrink-0">
                        {isSelected ? <FaCheck /> : <FaMagic />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold truncate">{song.title}</p>
                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={generatePlaylist}
                disabled={!selectedEmotion || !prompt.trim() || selectedSeeds.length !== 5 || isGenerating}
                className="px-12 py-4 rounded-xl bg-linear-to-r from-aurora-pink to-purple-600 font-bold text-lg hover:shadow-[0_0_30px_rgba(255,78,136,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <FaMagic />
                {isGenerating ? 'Generando...' : 'Generar Playlist'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Playlist View - Similar to normal playlist page */}
            <button
              onClick={() => {
                if (confirm('¿Seguro que quieres salir? La playlist generada se perderá.')) {
                  setStep('setup');
                  setGeneratedPlaylist([]);
                  setSelectedEmotion('');
                  setPrompt('');
                  setSelectedSeeds([]);
                }
              }}
              className="mb-8 text-gray-400 hover:text-white transition-colors"
            >
              ← Volver
            </button>

            {/* Hero Section */}
            <div className="relative mb-12 h-[450px] rounded-3xl overflow-hidden group">
              {/* Cinematic Background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-linear-to-br from-purple-900/40 via-pink-900/30 to-blue-900/40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,78,136,0.2),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.2),transparent_50%)]" />
                
                {/* Floating particles */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center px-12 z-10">
                {/* Album Art */}
                <div className="relative group-hover:scale-105 transition-transform duration-500">
                  <div className="w-64 h-64 rounded-2xl bg-linear-to-br from-aurora-pink via-purple-500 to-blue-500 shadow-2xl shadow-aurora-pink/50 flex items-center justify-center">
                    <FaMagic className="text-8xl text-white/90" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-aurora-pink/20 to-purple-600/20 blur-3xl -z-10" />
                </div>

                {/* Info */}
                <div className="ml-12 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full bg-aurora-pink/20 text-aurora-pink font-semibold text-sm border border-aurora-pink/50">
                      Playlist Temporal
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold text-sm">
                      {selectedEmotion}
                    </span>
                  </div>
                  
                  <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Playlist Generada con IA
                  </h1>
                  
                  <p className="text-gray-300 text-lg mb-6 max-w-2xl leading-relaxed">
                    {prompt}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-300">
                    <span className="flex items-center gap-2">
                      <FaMagic className="text-aurora-pink" />
                      {generatedPlaylist.length} canciones
                    </span>
                    <span>•</span>
                    <span>
                      {Math.floor(generatedPlaylist.reduce((acc, song) => acc + song.duration, 0) / 60)} min
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 mt-8">
                    <button
                      onClick={() => {
                        if (generatedPlaylist.length > 0) {
                          setCurrentSong(generatedPlaylist[0]);
                          setQueue(generatedPlaylist);
                          setIsPlaying(true);
                        }
                      }}
                      className="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
                    >
                      <FaPlay className="ml-0.5" />
                      Reproducir
                    </button>
                    
                    <button
                      onClick={() => setShowSaveModal(true)}
                      disabled={isSaving}
                      className="px-8 py-3 rounded-full bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      <FaSave />
                      Guardar Playlist
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Songs Table */}
            <div className="relative">
              {/* Glass morphism container */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[50px_50px_1fr_200px_100px] gap-4 px-6 py-4 border-b border-white/10 text-sm font-semibold text-gray-400">
                  <span className="text-center">#</span>
                  <span></span>
                  <span>TÍTULO</span>
                  <span>EMOCIÓN</span>
                  <span className="text-right">DURACIÓN</span>
                </div>

                {/* Songs */}
                <div className="divide-y divide-white/5">
                  {generatedPlaylist.map((song, index) => {
                    const isCurrentSong = currentSong?._id?.toString() === song._id?.toString();
                    const isCurrentPlaying = isCurrentSong && isPlaying;

                    return (
                      <div
                        key={`${song._id?.toString()}-${index}`}
                        className={`grid grid-cols-[50px_50px_1fr_200px_100px] gap-4 px-6 py-4 hover:bg-white/5 transition-colors group ${
                          isCurrentSong ? 'bg-aurora-pink/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <span className={`text-sm ${isCurrentSong ? 'text-aurora-pink font-bold' : 'text-gray-400'}`}>
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <button
                            onClick={() => handlePlay(song)}
                            className="w-10 h-10 rounded-lg bg-linear-to-br from-aurora-pink/20 to-purple-600/20 flex items-center justify-center hover:from-aurora-pink/40 hover:to-purple-600/40 transition-all hover:scale-110"
                          >
                            {isCurrentPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm ml-0.5" />}
                          </button>
                        </div>

                        <div className="flex items-center min-w-0">
                          <div className="min-w-0">
                            <p className={`font-semibold truncate ${isCurrentSong ? 'text-aurora-pink' : 'text-white'}`}>
                              {song.title}
                            </p>
                            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                            {song.emotion}
                          </span>
                        </div>

                        <div className="flex items-center justify-end">
                          <span className="text-sm text-gray-400">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <MusicPlayer />

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Guardar Playlist</h2>
            <p className="text-gray-400 mb-6">Dale un nombre a tu playlist generada con IA</p>
            
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Ej: Mi estado de ánimo perfecto"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-aurora-pink/50 focus:outline-none text-white placeholder-gray-500 mb-6"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && playlistName.trim()) {
                  savePlaylist();
                }
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setPlaylistName('');
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={savePlaylist}
                disabled={!playlistName.trim() || isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 font-bold hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaSave />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 78, 136, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 78, 136, 0.8);
        }
      `}</style>
    </div>
  );
}
