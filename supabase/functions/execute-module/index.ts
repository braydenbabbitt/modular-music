import { emptyPlaylist, writeTracksToPlaylist } from './spotify/playlist-writing.ts';
import { getSpotifyToken, refreshSpotifyToken } from './spotify/get-token.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { getModuleSources } from './database-helpers/get-module-sources.ts';
import { validateRequest } from './validation/validate-request.ts';
import { Database } from './types/database.ts';
import { getSourcesFromSpotify } from './spotify/get-sources.ts';
import { getModuleActions } from './database-helpers/get-module-actions.ts';
import { getModuleOutput } from './database-helpers/get-module-output.ts';
import { ACTION_TYPE_IDS, SimpleTrack } from './types/generics.ts';
import { getRandomNumber } from './utils/get-random-number.ts';
import { filterSongList } from './module-actions/filter-song-list.ts';

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
    const invokationTimestamp = new Date().toISOString();
    const { moduleId, scheduleId } = await validateRequest(req);
    const serviceRoleClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    try {
      const moduleQuery = await serviceRoleClient.from('modules').select().eq('id', moduleId).single();
      if (moduleQuery.error) {
        const errorBody = JSON.stringify({
          message: 'Error fetching module',
          error: moduleQuery.error,
        });
        throw new Error(errorBody);
      }
      const userId = moduleQuery.data.user_id;

      const spotifyToken = await getSpotifyToken({ serviceRoleClient, userId });

      const moduleSources = await getModuleSources(serviceRoleClient, moduleId);

      const fetchedSources = await getSourcesFromSpotify(
        userId,
        spotifyToken,
        serviceRoleClient,
        async () => await refreshSpotifyToken({ serviceRoleClient, userId }),
        moduleSources,
      );

      const moduleActions = await getModuleActions(serviceRoleClient, moduleId);

      const moduleOutput = await getModuleOutput(serviceRoleClient, moduleId);
      const outputLength = moduleOutput.limit;
      const moduleActionsWithoutShuffle = moduleActions.filter((action) => action.type_id !== ACTION_TYPE_IDS.SHUFFLE);
      const shouldShuffle = moduleActionsWithoutShuffle.length < moduleActions.length;

      let sourcesAfterActions: SimpleTrack[] = fetchedSources;
      await Promise.all(
        moduleActions.map(async (action) => {
          switch (action.type_id) {
            case ACTION_TYPE_IDS.FILTER:
              sourcesAfterActions = await filterSongList(userId, serviceRoleClient, sourcesAfterActions, action.id);
              break;
            default:
              break;
          }
        }),
      );
      const result: SimpleTrack[] = [];

      if (shouldShuffle) {
        const maxLength = sourcesAfterActions.length;
        while (result.length < outputLength && result.length < maxLength) {
          const nextRandomIndex = getRandomNumber(sourcesAfterActions.length);
          result.push(sourcesAfterActions.splice(nextRandomIndex, 1)[0]);
        }
      } else if (sourcesAfterActions.length < outputLength) {
        result.push(...sourcesAfterActions);
      } else {
        result.push(...sourcesAfterActions.slice(0, outputLength));
      }

      if (moduleOutput.append === null) {
        await emptyPlaylist(
          spotifyToken,
          moduleOutput.playlist_id,
          async () => await refreshSpotifyToken({ serviceRoleClient, userId }),
        );
      }

      await writeTracksToPlaylist(
        moduleOutput.playlist_id,
        result,
        moduleOutput.append === false,
        spotifyToken,
        async () => await refreshSpotifyToken({ serviceRoleClient, userId }),
      );

      await serviceRoleClient
        .from('module_runs_log')
        .insert({ module_id: moduleId, timestamp: invokationTimestamp, scheduled: !!scheduleId, error: false });

      if (scheduleId) await serviceRoleClient.functions.invoke('update_module_schedule', { body: `"${scheduleId}"` });

      return new Response(JSON.stringify(result), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error(err);
      await serviceRoleClient
        .from('module_runs_log')
        .insert({ module_id: moduleId, timestamp: invokationTimestamp, scheduled: !!scheduleId, error: true });
      return new Response(String(err?.message ?? err), {
        status: 500,
        headers: { ...CORS_HEADERS },
      });
    }
  } catch (err) {
    console.error(err);
    return new Response(String(err?.message ?? err), {
      status: 400,
      headers: { ...CORS_HEADERS },
    });
  }
});
