import { SupabaseClient } from 'https://esm.sh/v113/@supabase/supabase-js@2.13.1/dist/module/index.js';
import { Database } from '../types/database.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

/**
 * Retrieves the user's Spotify access token from their Supabase user metadata, refreshing it if it has expired.
 *
 * @param {SupabaseClient<Database>} supabaseClient - The Supabase client used to fetch the user's metadata.
 * @returns {Promise<string>} - The user's Spotify access token.
 * @throws {Error} - If Spotify client ID and secret are not provided or there are errors fetching user metadata.
 */
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

/**
    Refreshes the Spotify access token for the currently authenticated user in Supabase.
    @async
    @param {SupabaseClient<Database>} supabaseClient - The Supabase client to use for querying the authenticated user's information.
    @param {string} refreshToken - (Optional) The refresh token to use for refreshing the access token. If not provided, the refresh token will be fetched from the Supabase user metadata.
    @returns {Promise<string>} - The new access token retrieved from Spotify.
    @throws {Error} - If there is an error getting the Spotify secrets, fetching the Supabase user, finding the refresh token in the user metadata, refreshing the Spotify token, or parsing the response from Spotify.
    */
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
