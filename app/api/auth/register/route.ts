import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/types/models';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: Partial<User> = {
      email,
      password: hashedPassword,
      name,
      likedSongs: [],
      playlists: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<User>('users').insertOne(newUser as User);

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
