import { SupabaseClient } from 'https://esm.sh/v113/@supabase/supabase-js@2.13.1/dist/module/index.js';
import { Database } from '../types/database.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

/**
  Asynchronously retrieves the Spotify OAuth token for the given user from the user_tokens table in Supabase. If
  the token has expired, it is refreshed using the refreshSpotifyToken function.
  @param serviceRoleClient - The Supabase client to use for querying and updating the user_oauth_tokens table using a service role.
  @param oauthTokenRow - An object representing a row from the user_oauth_tokens table in
  Supabase, containing the user_id, provider_token, provider_refresh_token, and provider_token_expires_at
  fields for the user.
  @returns A Promise resolving to the current Spotify access token.
  @throws {Error} If SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET are not defined, or if the Spotify token refresh
  action fails or returns invalid data.
  */
export const getSpotifyToken = async (
  serviceRoleClient: SupabaseClient<Database>,
  oauthTokenRow: Database['public']['Tables']['user_oauth_tokens']['Row'],
): Promise<string> => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  if (Number(oauthTokenRow.provider_token_expires_at) < Date.now()) {
    return await refreshSpotifyToken(serviceRoleClient, oauthTokenRow);
  }

  return oauthTokenRow.provider_token;
};

/**
  Asynchronously refreshes the Spotify OAuth token for the given user by sending a POST request to
  https://accounts.spotify.com/api/token with the provided refresh token. Updates the user_tokens table in
  Supabase with the new token information.
  @param serviceRoleClient - The Supabase client to use for querying and updating the user_oauth_tokens table using a service role.
  @param userTokensRow - A row from the user_oauth_tokens table.
  @returns A Promise resolving to the new Spotify access token.
  @throws {Error} If SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET are not defined, or if the Spotify token refresh
  action fails or returns invalid data.
  */
export const refreshSpotifyToken = async (
  oauthTokensClient: SupabaseClient<Database>,
  { user_id, provider_refresh_token }: Database['public']['Tables']['user_oauth_tokens']['Row'],
) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  const formData = [];
  formData.push(encodeURIComponent('grant_type') + '=' + encodeURIComponent('refresh_token'));
  formData.push(encodeURIComponent('refresh_token') + '=' + encodeURIComponent(provider_refresh_token));
  const fetchTimestamp = Date.now();
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

  oauthTokensClient
    .from('user_oauth_tokens')
    .update({
      provider_token: parsedRes.access_token,
      provider_refresh_token: parsedRes.refresh_token,
      provider_token_expires_at: fetchTimestamp + Number(parsedRes.expires_in),
    })
    .eq('user_id', user_id);

  return parsedRes.access_token;
};
