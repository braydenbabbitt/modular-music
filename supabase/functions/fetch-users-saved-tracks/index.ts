import { attemptSpotifyApiRequest } from './spotify/helpers.ts';
import { getLastUserSavedTrack } from './database-helpers/get-last-user-saved-tracks.ts';
import { getSpotifyToken, refreshSpotifyToken } from './spotify/get-token.ts';
import { Database } from './types/database.ts';
import { validateRequest } from './validation/validate-request.ts';
import { getUserSavedTracks } from './spotify/get-user-saved-tracks.ts';
import { serve } from 'http-server';
import { createClient } from 'supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({
        message: 'Error starting supabase client',
        error:
          'Unable to retrieve environment variables: ' +
          `${!SUPABASE_URL ? 'SUPABASE_URL ' : ''}${
            !SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY ' : ''
          }`.trim(),
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const { userId } = await validateRequest(req);
    const serviceRoleClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    let spotifyTokenData = await getSpotifyToken({ serviceRoleClient, userId });
    const userLastSavedTrack = await getLastUserSavedTrack({ serviceRoleClient, userId });
    const lastSavedTrackTimestamp = userLastSavedTrack?.added_at;
    const newUserSavedTracks = await attemptSpotifyApiRequest(
      async (newToken?: string, initOffset?: string) =>
        await getUserSavedTracks({
          spotifyToken: newToken ?? spotifyTokenData.token,
          initOffset: initOffset ? parseInt(initOffset, 10) : undefined,
          addedAtLimit: lastSavedTrackTimestamp ?? undefined,
        }),
      async () => {
        spotifyTokenData = await refreshSpotifyToken({ serviceRoleClient, userId });
        return spotifyTokenData.token;
      },
    );
    if (typeof newUserSavedTracks === 'string') {
      throw new Error(
        JSON.stringify({ message: 'Unexpected string from getUserSavedTracks', result: newUserSavedTracks }),
      );
    }
    const newTracksRows = newUserSavedTracks.flatMap((track) =>
      track.track.id ? [{ track_id: track.track.id, user_id: userId, added_at: track.added_at }] : [],
    );
    await serviceRoleClient.from('users_saved_tracks').insert(newTracksRows, { count: 'exact' }).select('id');

    const result = await serviceRoleClient.from('users_saved_tracks').select('track_id').eq('user_id', userId);

    return new Response(JSON.stringify(result.data?.map((obj) => obj.track_id) ?? []), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' },
    });
  }
});
