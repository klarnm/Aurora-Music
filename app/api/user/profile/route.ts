import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await db.collection('users').findOne({ 
        email,
        _id: { $ne: new ObjectId(session.user.id) }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'El email ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: { 
          name,
          email,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}
