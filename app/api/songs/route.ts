import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Song } from '@/types/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const genre = searchParams.get('genre');
    const emotion = searchParams.get('emotion');
    const search = searchParams.get('search');

    const db = await getDatabase();
    const collection = db.collection<Song>('songs');

    let filter: any = {};

    if (genre) {
      filter.genre = new RegExp(genre, 'i');
    }

    if (emotion) {
      filter.emotion = new RegExp(emotion, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { artist: new RegExp(search, 'i') },
        { genre: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;

    const [songs, total] = await Promise.all([
      collection.find(filter).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    return NextResponse.json({
      songs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
