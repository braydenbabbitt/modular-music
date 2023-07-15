import { setUpCronJob } from './db-queries/schedule-next-cron-job.ts';
import { unscheduleCronJob } from './db-queries/unschedule-cron-job.ts';
import { shouldBeRescheduled } from './should-be-rescheduled.ts';
import { Database } from './types/database.ts';
import { createClient } from 'supabase-js';
import { validateRequest } from './validation/validate-request.ts';
import { serve } from 'http-server';
import { Pool } from 'postgres';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_DB_URL = Deno.env.get('SUPABASE_DB_URL');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const dbPool = new Pool(SUPABASE_DB_URL, 3, true);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  try {
    const { authHeader, scheduleId, isNew } = await validateRequest(req);
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

    const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    const schedule = await supabaseClient
      .from('module_schedules')
      .select()
      .eq('id', scheduleId)
      .is('deleted_at', null)
      .single();

    if (!schedule.data) {
      throw new Error(`Schedule with id ${scheduleId} not found`);
    }

    if (schedule.data.has_cron_job) await unscheduleCronJob(dbPool, scheduleId);

    const shouldBeRescheduledBool = await shouldBeRescheduled(supabaseClient, schedule.data);

    if (shouldBeRescheduledBool || isNew) {
      const nextRun = await setUpCronJob(dbPool, schedule.data, isNew);
      if (nextRun)
        await supabaseClient
          .from('module_schedules')
          .update({ next_run: nextRun.toISOString(), has_cron_job: true })
          .eq('id', scheduleId);
    } else {
      if (schedule.data.has_cron_job === true || schedule.data.next_run !== null)
        supabaseClient.from('module_schedules').update({ next_run: null, has_cron_job: false }).eq('id', scheduleId);
    }
  } catch (error) {
    console.error(error);
    return new Response(String(error?.message ?? error), {
      status: 400,
      headers: { ...CORS_HEADERS },
    });
  }

  return new Response(JSON.stringify('fake response'), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
});
