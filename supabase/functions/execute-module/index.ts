import { getSpotifyToken, refreshSpotifyToken } from './spotify/get-token.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { getModuleSources } from './database-helpers/get-module-sources.ts';
import { validateRequest } from './validation/validate-request.ts';
import { Database } from './types/database.ts';
import { getSourcesFromSpotify } from './spotify/get-sources.ts';

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
    const { moduleId, authHeader } = await validateRequest(req);
    const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        persistSession: false,
      },
    });

    const moduleQuery = await supabaseClient.from('modules').select().eq('id', moduleId).single();
    if (moduleQuery.error) {
      return new Response(
        JSON.stringify({
          message: 'Error fetching module',
          error: moduleQuery.error,
        }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    const spotifyToken = await getSpotifyToken(supabaseClient);

    const moduleSourcesQuery = await getModuleSources(supabaseClient, moduleId);

    if (moduleSourcesQuery.error || !moduleSourcesQuery.data) {
      return new Response(
        JSON.stringify({
          message: 'Error fetching module sources',
          error: 'Error in supabase query',
        }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    const fetchedSources = await getSourcesFromSpotify(
      spotifyToken,
      async () => await refreshSpotifyToken(supabaseClient),
      moduleSourcesQuery.data,
    );

    return new Response(JSON.stringify(fetchedSources), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(err, {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
