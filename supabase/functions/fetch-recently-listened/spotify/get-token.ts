import { SupabaseClient } from 'supabase-js';
import { Database } from '../types/database.ts';
import { SpotifyTokenData } from '../types/generics.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

type TokenRequest = {
  serviceRoleClient: SupabaseClient<Database>;
  userId: string;
  currentTokenData?: SpotifyTokenData;
};

export const getSpotifyToken = async ({
  serviceRoleClient,
  userId,
  currentTokenData,
}: TokenRequest): Promise<SpotifyTokenData> => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  if (!currentTokenData || currentTokenData.expiresAt < new Date().getTime()) {
    const newTokenQuery = await serviceRoleClient.functions.invoke<SpotifyTokenData>('get-spotify-token', {
      body: { userId },
    });

    if (newTokenQuery.error || newTokenQuery.data === null) {
      throw new Error('Error fetching new token');
    }

    return newTokenQuery.data;
  }

  return currentTokenData;
};

export const refreshSpotifyToken = async ({ serviceRoleClient, userId }: TokenRequest) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  const newTokenQuery = await serviceRoleClient.functions.invoke<SpotifyTokenData>('get-spotify-token', {
    body: { userId, forceRefetch: true },
  });

  if (newTokenQuery.error || newTokenQuery.data === null) {
    throw new Error('Error fetching new token');
  }

  return newTokenQuery.data;
};
