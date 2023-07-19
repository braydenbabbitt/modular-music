import { fetchPlaylistSnapshotId, fetchPlaylistTracks } from './spotify/fetch-playlist.ts';
import { serve } from 'http-server';
import { validateRequest } from './validation/validate-request.ts';
import { createClient } from 'supabase-js';
import { Database } from './types/database.ts';
import { getSpotifyToken, refreshSpotifyToken } from './spotify/get-token.ts';
import { attemptSpotifyApiRequest } from './spotify/token-helpers.ts';

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
            !SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : ''
          }`.trim(),
      }),
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  try {
    const { userId, playlistId } = await validateRequest(req);
    const publicSchemaClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });
    const spotifySchemaClient = createClient<Database, 'spotify'>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      db: {
        schema: 'spotify',
      },
      auth: {
        persistSession: false,
      },
    });

    const spotifyToken = await getSpotifyToken({ serviceRoleClient: publicSchemaClient, userId });

    const currentSnapshotId = await attemptSpotifyApiRequest(
      (newToken?: string) => fetchPlaylistSnapshotId({ spotifyToken: newToken ?? spotifyToken, playlistId }),
      () => refreshSpotifyToken({ serviceRoleClient: publicSchemaClient, userId }),
    );

    const savedPlaylist = await spotifySchemaClient.from('playlists').select().eq('id', playlistId).maybeSingle();
    const shouldUseSavedPlaylist = savedPlaylist.data?.snapshot_id === currentSnapshotId;

    if (shouldUseSavedPlaylist) {
      return new Response(JSON.stringify(savedPlaylist.data?.track_ids ?? []), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }

    const newPlaylistTracks = await attemptSpotifyApiRequest(
      (newToken?: string) => fetchPlaylistTracks({ spotifyToken: newToken ?? spotifyToken, playlistId }),
      () => refreshSpotifyToken({ serviceRoleClient: publicSchemaClient, userId }),
    );
    const newPlaylistTrackIds = newPlaylistTracks.map((track) => track.id);

    spotifySchemaClient.from('playlists').upsert(
      {
        id: playlistId,
        snapshot_id: currentSnapshotId,
        track_ids: newPlaylistTrackIds,
        last_fetched_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

    return new Response(JSON.stringify(newPlaylistTrackIds), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(err, {
      status: 400,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  }
});
