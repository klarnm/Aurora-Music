import { ObjectId } from 'mongodb';

export interface Song {
  _id?: ObjectId;
  title: string;
  artist: string;
  genre: string;
  emotion: string;
  duration: number;
  plays?: number;
  likes?: number;
  imageUrl?: string;
  createdAt?: Date;
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  likedSongs?: ObjectId[];
  playlists?: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Playlist {
  _id?: ObjectId;
  name: string;
  description?: string;
  userId: ObjectId;
  songs: ObjectId[];
  imageUrl?: string;
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayHistory {
  _id?: ObjectId;
  userId: ObjectId;
  songId: ObjectId;
  playedAt: Date;
}
