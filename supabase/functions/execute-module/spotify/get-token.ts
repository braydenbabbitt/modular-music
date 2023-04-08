import { SupabaseClient } from 'https://esm.sh/v113/@supabase/supabase-js@2.13.1/dist/module/index.js';
import { Database } from '../types/database.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

export const getSpotifyToken = async (supabaseClient: SupabaseClient<Database>): Promise<string> => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  const userQuery = await supabaseClient.auth.getUser();
  if (userQuery.error || !userQuery.data.user) {
    throw new Error('Error fetching supabase user');
  }

  let { provider_token } = userQuery.data.user.user_metadata;
  const { provider_refresh_token, provider_token_expires_at } = userQuery.data.user.user_metadata;

  if (Number(provider_token_expires_at) < Date.now()) {
    provider_token = refreshSpotifyToken(supabaseClient, provider_refresh_token);
  }

  return provider_token;
};

export const refreshSpotifyToken = async (supabaseClient: SupabaseClient<Database>, refreshToken?: string) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  if (!refreshToken) {
    const userQuery = await supabaseClient.auth.getUser();
    if (userQuery.error || !userQuery.data.user) {
      throw new Error('Error fetching supabase user');
    }

    if (
      !userQuery.data.user.user_metadata.provider_refresh_token ||
      typeof userQuery.data.user.user_metadata.provider_refresh_token !== 'string'
    ) {
      throw new Error('No refresh token in user_metadata');
    }
    refreshToken = userQuery.data.user.user_metadata.provider_refresh_token;
  }
  const formData = [];
  formData.push(encodeURIComponent('grant_type') + '=' + encodeURIComponent('refresh_token'));
  formData.push(encodeURIComponent('refresh_token') + '=' + encodeURIComponent(refreshToken));
  const newTokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: formData.join('&'),
  });

  if (newTokenRes.status !== 200 || !newTokenRes.body) {
    throw new Error(
      JSON.stringify({
        message: 'Error refreshing Spotify token',
        response: newTokenRes,
        request: { formData },
      }),
    );
  }

  const parsedRes = await newTokenRes.json();
  if (!parsedRes.access_token) {
    throw new Error(
      JSON.stringify({
        message: 'Error parsing response from Spotify token refresh action',
        response: newTokenRes,
      }),
    );
  }

  supabaseClient.auth.updateUser({
    data: {
      provider_token: parsedRes.access_token,
      provider_refresh_token: parsedRes.refresh_token,
      provider_token_expires_at: Date.now() + Number(parsedRes.expires_in),
    },
  });

  return parsedRes.access_token;
};
