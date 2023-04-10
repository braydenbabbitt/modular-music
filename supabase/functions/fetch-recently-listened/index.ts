import { getSpotifyToken, refreshSpotifyToken } from './../execute-module/spotify/get-token.ts';
import { validateRequest } from './../execute-module/validation/validate-request.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Database } from './types/database.ts';
import { getRecentlyListened } from './spotify/get-recently-listened.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MS_IN_DAY = 86400000;

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
    const currentCursorQuery = await supabaseClient
      .from('users_spotify_recently_played_cursors')
      .select()
      .eq('id', supabaseUser.data.user.id)
      .maybeSingle();

    const recentlyListened = await getRecentlyListened(
      spotifyToken,
      async () => await refreshSpotifyToken(supabaseClient),
      currentCursorQuery,
    );

    const oneMonthAgo = new Date(Date.now() - 31 * MS_IN_DAY).toISOString();
    const newItems = recentlyListened.items;
    const fetchTime = new Date().toISOString();

    await supabaseClient
      .from('users_spotify_recently_played_items')
      .delete()
      .eq('user_id', supabaseUser.data.user.id)
      .filter('played_at', 'not.gt', oneMonthAgo);

    const oldestItem = await supabaseClient
      .from('users_spotify_recently_played_items')
      .select()
      .order('played_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const newCursorRow: Database['public']['Tables']['users_spotify_recently_played_cursors']['Insert'] = {
      id: supabaseUser.data.user.id,
      last_fetched_at: fetchTime,
    };
    if (oldestItem.data) {
      newCursorRow.oldest_played_at = oldestItem.data.played_at;
    }

    if (!recentlyListened.items.length) {
      if (newCursorRow.oldest_played_at) {
        await supabaseClient.from('users_spotify_recently_played_cursors').upsert(newCursorRow, { onConflict: 'id' });
      }
      return new Response(JSON.stringify('No new items fetched'), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const itemsRes = await supabaseClient.from('users_spotify_recently_played_items').insert(
      newItems.map((item) => ({
        user_id: supabaseUser.data.user.id,
        track_id: item.id,
        played_at: item.played_at,
      })),
    );

    if (itemsRes.error) {
      throw new Error(JSON.stringify({ message: 'Error inserting recently listened items', user: supabaseUser }));
    }

    await supabaseClient.from('users_spotify_recently_played_cursors').upsert(
      {
        oldest_played_at: recentlyListened.items.at(-1)?.played_at,
        ...newCursorRow,
        after: recentlyListened.newCursor ?? null,
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
