import { SupabaseClient } from 'supabase-js';
import { Database } from '../types/database.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

type RefreshSpotifyTokenResponse = {
  token: string;
  expiresAt: number;
};

export const refreshSpotifyToken = async (
  oauthTokensClient: SupabaseClient<Database>,
  { user_id, provider_refresh_token }: Database['public']['Tables']['user_oauth_tokens']['Row'],
): Promise<RefreshSpotifyTokenResponse> => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  const formData = [];
  formData.push(encodeURIComponent('grant_type') + '=' + encodeURIComponent('refresh_token'));
  formData.push(encodeURIComponent('refresh_token') + '=' + encodeURIComponent(provider_refresh_token));
  const fetchTimestamp = new Date().getTime();
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
  const newExpirationTimestamp = fetchTimestamp + Number(parsedRes.expires_in) * 1000;

  await oauthTokensClient
    .from('user_oauth_tokens')
    .update({
      provider_token: parsedRes.access_token,
      provider_refresh_token: parsedRes.refresh_token,
      provider_token_expires_at: newExpirationTimestamp,
      updated_at: new Date(fetchTimestamp).toISOString(),
    })
    .eq('user_id', user_id);

  return { token: parsedRes.access_token, expiresAt: newExpirationTimestamp };
};
