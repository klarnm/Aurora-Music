import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get user's liked songs
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
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const likedSongIds = user.likedSongs || [];
    
    // Get full song details
    const songs = await db
      .collection('songs')
      .find({ _id: { $in: likedSongIds } })
      .toArray();

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add song to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { songId } = await request.json();

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const songObjectId = new ObjectId(songId);

    // Add song to user's liked songs (avoid duplicates)
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $addToSet: { likedSongs: songObjectId },
        $set: { updatedAt: new Date() }
      }
    );

    // Increment song's like count
    await db.collection('songs').updateOne(
      { _id: songObjectId },
      { $inc: { likes: 1 } }
    );

    return NextResponse.json({ message: 'Song added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove song from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const songObjectId = new ObjectId(songId);

    // Remove song from user's liked songs
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $pull: { likedSongs: songObjectId } as any,
        $set: { updatedAt: new Date() }
      }
    );

    // Decrement song's like count
    await db.collection('songs').updateOne(
      { _id: songObjectId },
      { $inc: { likes: -1 } }
    );

    return NextResponse.json({ message: 'Song removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
