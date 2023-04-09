import { getSpotifyToken, refreshSpotifyToken } from './../execute-module/spotify/get-token.ts';
import { validateRequest } from './../execute-module/validation/validate-request.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Database } from './types/database.ts';
import { RecentlyListenedTracks, getRecentlyListened } from './spotify/get-recently-listened.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(
      JSON.stringify({
        message: 'Error starting supabase client',
        error:
          'Unable to retrieve environment variables: ' +
          `${!SUPABASE_URL ? 'SUPABASE_URL ' : ''}${!SUPABASE_ANON_KEY ? 'SUPABASE_ANON_KEY' : ''}`.trim(),
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const { authHeader } = await validateRequest(req);
    const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        persistSession: false,
      },
    });

    const supabaseUser = await supabaseClient.auth.getUser();
    if (!supabaseUser.data || supabaseUser.error) {
      throw new Error('Error fetching supabase user');
    }

    const spotifyToken = await getSpotifyToken(supabaseClient);
    const savedRecentlyPlayed = await supabaseClient
      .from('users_spotify_recently_listened')
      .select()
      .eq('id', supabaseUser.data.user.id)
      .maybeSingle();

    const recentlyListened = await getRecentlyListened(
      supabaseClient,
      spotifyToken,
      async () => await refreshSpotifyToken(supabaseClient),
      supabaseUser.data.user.id,
      savedRecentlyPlayed,
    );

    const newItems = savedRecentlyPlayed.data
      ? [...recentlyListened.items, ...(savedRecentlyPlayed.data?.list as RecentlyListenedTracks[])]
      : recentlyListened.items;

    await supabaseClient.from('users_spotify_recently_listened').upsert(
      {
        id: supabaseUser.data.user.id,
        list: newItems,
        cursor: recentlyListened.newCursor,
        oldest_item: newItems.at(-1)?.played_at,
        last_fetched_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

    return new Response(JSON.stringify(newItems), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(err, {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
