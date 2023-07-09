import { Supabase } from '../dependencies.ts';
import { Database } from '../types/database.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

type TokenRequest = {
  serviceRoleClient: Supabase.SupabaseClient<Database>;
} & (
  | {
      oauthTokenRow: Database['public']['Tables']['user_oauth_tokens']['Row'];
      userId?: never;
    }
  | {
      oauthTokenRow?: never;
      userId: string;
    }
);

export const getSpotifyToken = async ({ serviceRoleClient, oauthTokenRow, userId }: TokenRequest): Promise<string> => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  if (!oauthTokenRow) {
    const oauthTokenRowQuery = await serviceRoleClient
      .from('user_oauth_tokens')
      .select()
      .eq('user_id', userId)
      .maybeSingle();

    if (oauthTokenRowQuery.error || oauthTokenRowQuery.data === null) {
      throw new Error('Error fetching oauth token row');
    }

    oauthTokenRow = oauthTokenRowQuery.data;
  }

  if (Number(oauthTokenRow.provider_token_expires_at) < Date.now()) {
    return await refreshSpotifyToken({ serviceRoleClient, oauthTokenRow });
  }

  return oauthTokenRow.provider_token;
};

export const refreshSpotifyToken = async ({ serviceRoleClient, oauthTokenRow, userId }: TokenRequest) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Error getting spotify secrets');
  }

  if (!oauthTokenRow) {
    const oauthTokenRowQuery = await serviceRoleClient
      .from('user_oauth_tokens')
      .select()
      .eq('user_id', userId)
      .maybeSingle();

    if (oauthTokenRowQuery.error || oauthTokenRowQuery.data === null) throw new Error('Error fetching oauth token row');

    oauthTokenRow = oauthTokenRowQuery.data;
  }

  const formData = [];
  formData.push(encodeURIComponent('grant_type') + '=' + encodeURIComponent('refresh_token'));
  formData.push(encodeURIComponent('refresh_token') + '=' + encodeURIComponent(oauthTokenRow.provider_refresh_token));
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

  serviceRoleClient
    .from('user_oauth_tokens')
    .update({
      provider_token: parsedRes.access_token,
      provider_refresh_token: parsedRes.refresh_token,
      provider_token_expires_at: fetchTimestamp + Number(parsedRes.expires_in),
      updated_at: new Date(fetchTimestamp).toISOString(),
    })
    .eq('user_id', oauthTokenRow.user_id);

  return parsedRes.access_token;
};
