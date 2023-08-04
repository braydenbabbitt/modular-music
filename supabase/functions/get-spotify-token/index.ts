import { Database } from './types/database.ts';
import { createClient } from 'supabase-js';
import { serve } from 'http-server';
import { validateRequest } from './validation/validate-request.ts';
import { refreshSpotifyToken } from './spotify-helpers/refresh-token.ts';

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
    const { userId, forceRefetch } = await validateRequest(req);
    const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });
    const oauthTokenRowQuery = await supabaseClient
      .from('user_oauth_tokens')
      .select()
      .eq('user_id', userId)
      .maybeSingle();

    if (oauthTokenRowQuery.error || oauthTokenRowQuery.data === null)
      throw new Error('Error fetching user credentials');

    const currentTimestamp = new Date().getTime();
    const tokenIsActive = currentTimestamp < oauthTokenRowQuery.data.provider_token_expires_at;
    if (tokenIsActive && !forceRefetch) {
      return new Response(
        JSON.stringify({
          token: oauthTokenRowQuery.data.provider_token,
          expiresAt: oauthTokenRowQuery.data.provider_token_expires_at,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    const newTokenData = await refreshSpotifyToken(supabaseClient, oauthTokenRowQuery.data);
    return new Response(JSON.stringify(newTokenData), {
      status: 201,
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
