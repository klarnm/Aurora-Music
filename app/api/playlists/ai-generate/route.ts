import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Song } from '@/types/models';
import { ObjectId } from 'mongodb';

interface AIGenerateRequest {
  emotion: string;
  prompt: string;
  seedSongs: string[]; // Array of song IDs
}

export async function POST(request: NextRequest) {
  try {
    const body: AIGenerateRequest = await request.json();
    const { emotion, prompt, seedSongs } = body;

    if (!emotion || !seedSongs || seedSongs.length !== 5) {
      return NextResponse.json(
        { error: 'Se requiere emoción y exactamente 5 canciones semilla' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const songsCollection = db.collection<Song>('songs');

    // Obtener las canciones semilla
    const seedSongDocs = await songsCollection
      .find({
        _id: { $in: seedSongs.map(id => new ObjectId(id)) }
      })
      .toArray();

    if (seedSongDocs.length !== 5) {
      return NextResponse.json(
        { error: 'No se pudieron encontrar todas las canciones semilla' },
        { status: 404 }
      );
    }

    // Extraer géneros y artistas de las canciones semilla
    const seedGenres = [...new Set(seedSongDocs.map(song => song.genre))];
    const seedArtists = [...new Set(seedSongDocs.map(song => song.artist))];

    // Pseudo-IA: Algoritmo de recomendación basado en:
    // 1. Emoción seleccionada (50% peso)
    // 2. Géneros de canciones semilla (30% peso)
    // 3. Artistas similares (20% peso)
    // 4. Keywords del prompt (bonus)

    // Buscar canciones con la misma emoción
    const emotionMatches = await songsCollection
      .find({
        emotion: new RegExp(emotion, 'i'),
        _id: { $nin: seedSongs.map(id => new ObjectId(id)) }
      })
      .limit(50)
      .toArray();

    // Buscar canciones del mismo género
    const genreMatches = await songsCollection
      .find({
        genre: { $in: seedGenres.map(g => new RegExp(g, 'i')) },
        _id: { $nin: seedSongs.map(id => new ObjectId(id)) }
      })
      .limit(30)
      .toArray();

    // Buscar canciones de los mismos artistas
    const artistMatches = await songsCollection
      .find({
        artist: { $in: seedArtists.map(a => new RegExp(a, 'i')) },
        _id: { $nin: seedSongs.map(id => new ObjectId(id)) }
      })
      .limit(20)
      .toArray();

    // Combinar y puntuar canciones
    const songScores = new Map<string, { song: Song; score: number }>();

    // Puntuar matches de emoción (peso 50)
    emotionMatches.forEach(song => {
      const id = song._id!.toString();
      songScores.set(id, { song, score: 50 });
    });

    // Puntuar matches de género (peso 30)
    genreMatches.forEach(song => {
      const id = song._id!.toString();
      const existing = songScores.get(id);
      if (existing) {
        existing.score += 30;
      } else {
        songScores.set(id, { song, score: 30 });
      }
    });

    // Puntuar matches de artista (peso 20)
    artistMatches.forEach(song => {
      const id = song._id!.toString();
      const existing = songScores.get(id);
      if (existing) {
        existing.score += 20;
      } else {
        songScores.set(id, { song, score: 20 });
      }
    });

    // Bonus por keywords en el prompt
    if (prompt) {
      const keywords = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      songScores.forEach((value, id) => {
        const song = value.song;
        const songText = `${song.title} ${song.artist} ${song.genre} ${song.emotion}`.toLowerCase();
        
        keywords.forEach(keyword => {
          if (songText.includes(keyword)) {
            value.score += 5;
          }
        });
      });
    }

    // Bonus por popularidad (plays + likes)
    songScores.forEach((value) => {
      const popularity = (value.song.plays || 0) + (value.song.likes || 0) * 2;
      value.score += Math.min(popularity / 100, 10); // Max 10 puntos bonus
    });

    // Ordenar por puntaje y tomar top 15 (+ 5 semilla = 20 total)
    const recommendedSongs = Array.from(songScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map(item => item.song);

    // Si no hay suficientes canciones, rellenar con canciones aleatorias de la misma emoción
    if (recommendedSongs.length < 15) {
      const additionalSongs = await songsCollection
        .aggregate([
          {
            $match: {
              emotion: new RegExp(emotion, 'i'),
              _id: {
                $nin: [
                  ...seedSongs.map(id => new ObjectId(id)),
                  ...recommendedSongs.map(s => s._id!)
                ]
              }
            }
          },
          { $sample: { size: 15 - recommendedSongs.length } }
        ])
        .toArray();

      recommendedSongs.push(...additionalSongs);
    }

    // Mezclar canciones semilla y recomendadas de forma inteligente
    // Patrón: semilla, 3 recomendadas, semilla, 3 recomendadas...
    const finalPlaylist: Song[] = [];
    let seedIndex = 0;
    let recIndex = 0;

    while (finalPlaylist.length < 20) {
      // Agregar una canción semilla
      if (seedIndex < seedSongDocs.length) {
        finalPlaylist.push(seedSongDocs[seedIndex]);
        seedIndex++;
      }

      // Agregar 3 canciones recomendadas
      for (let i = 0; i < 3 && recIndex < recommendedSongs.length && finalPlaylist.length < 20; i++) {
        finalPlaylist.push(recommendedSongs[recIndex]);
        recIndex++;
      }
    }

    return NextResponse.json({
      success: true,
      playlist: finalPlaylist,
      metadata: {
        emotion,
        prompt,
        seedSongs: seedSongDocs,
        totalSongs: finalPlaylist.length,
        genres: seedGenres,
        artists: seedArtists
      }
    });

  } catch (error) {
    console.error('Error generando playlist con IA:', error);
    return NextResponse.json(
      { error: 'Error al generar playlist' },
      { status: 500 }
    );
  }
}
