import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { Playlist } from '@/types/models';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const playlists = await db
      .collection<Playlist>('playlists')
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    // Ensure all playlists have proper name field
    const validPlaylists = playlists.map(p => ({
      ...p,
      name: p.name || 'Playlist sin nombre',
      _id: p._id,
      songs: p.songs || [],
      description: p.description || '',
    }));

    return NextResponse.json({ playlists: validPlaylists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, songs } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const newPlaylist: Partial<Playlist> = {
      name,
      description: description || '',
      userId: new ObjectId(session.user.id),
      songs: songs.map((id: string) => new ObjectId(id)),
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Playlist>('playlists').insertOne(newPlaylist as Playlist);

    return NextResponse.json(
      { 
        success: true,
        message: 'Playlist created successfully',
        playlistId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
