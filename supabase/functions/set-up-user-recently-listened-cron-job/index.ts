import * as postgres from 'https://deno.land/x/postgres@v0.14.2/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SUPABASE_DB_URL = Deno.env.get('SUPABASE_DB_URL');
const SUPABASE_PROJECT_REF = Deno.env.get('SUPABASE_PROJECT_REF');
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const pool = new postgres.Pool(SUPABASE_DB_URL, 3, true);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  try {
    const connection = await pool.connect();
    const authHeader = req.headers.get('Authorization');

    const query = `
        select
          cron.schedule(
            'set-up-user-recently-listened-fetch-every-2-hours',
            '0 */2 * * *',
            $$
            select
              net.http_post(
                  url:='https://${SUPABASE_PROJECT_REF}.functions.supabase.co/fetch-recently-listened',
                  headers:='{ "Content-Type": "application/json", "Authorization": "${authHeader}"}'::jsonb,
                  body:=concat('{"time": "', now(), '"}')::jsonb
              ) as request_id;
            $$
          );
      `;

    try {
      await connection.queryObject(query);

      return new Response(undefined, { status: 200, headers: { ...CORS_HEADERS } });
    } finally {
      connection.release();
    }
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Error setting up cron job for user', error: err }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...CORS_HEADERS,
      },
    });
  }
});
