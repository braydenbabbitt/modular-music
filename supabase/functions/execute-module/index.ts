import { attemptSpotifyApiRequest } from './spotify/token-helpers.ts';
import { removeTracksNoLongerSaved } from './spotify/get-tracks-no-longer-saved.ts';
import { emptyPlaylist, writeTracksToPlaylist } from './spotify/playlist-writing.ts';
import { getSpotifyToken, refreshSpotifyToken } from './spotify/get-token.ts';
import { serve } from 'http-server';
import { getModuleSources } from './database-helpers/get-module-sources.ts';
import { validateRequest } from './validation/validate-request.ts';
import { Database } from './types/database.ts';
import { getSourcesFromSpotify } from './spotify/get-sources.ts';
import { getModuleActions } from './database-helpers/get-module-actions.ts';
import { getModuleOutput } from './database-helpers/get-module-output.ts';
import { ACTION_TYPE_IDS, SimpleTrack } from './types/generics.ts';
import { getRandomNumber } from './utils/get-random-number.ts';
import { filterSongList } from './module-actions/filter-song-list.ts';
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
      let result: SimpleTrack[] = [];

      if (shouldShuffle) {
        const maxLength = sourcesAfterActions.length;
        while (result.length < outputLength && result.length < maxLength) {
          while (result.length < outputLength && result.length < maxLength) {
            const nextRandomIndex = getRandomNumber(sourcesAfterActions.length);
            const nextRandomTrack = sourcesAfterActions.at(nextRandomIndex);
            if (nextRandomTrack) {
              result.push(nextRandomTrack);
            }
          }
          const tracksToCheck = result.filter((track) => !!track.fromSavedTracks);
          const tracksStillSaved = await attemptSpotifyApiRequest(
            (newToken) =>
              removeTracksNoLongerSaved({
                serviceRoleClient,
                spotifyToken: newToken ?? spotifyToken,
                tracks: tracksToCheck,
                userId,
              }),
            () => refreshSpotifyToken({ serviceRoleClient, userId }),
          );
          if (tracksStillSaved.length !== result.length) {
            result = tracksStillSaved;
          }
        }
      } else if (sourcesAfterActions.length < outputLength) {
        const tracksStillSaved = await attemptSpotifyApiRequest(
          (newToken) =>
            removeTracksNoLongerSaved({
              serviceRoleClient,
              spotifyToken: newToken ?? spotifyToken,
              tracks: sourcesAfterActions,
              userId,
            }),
          () => refreshSpotifyToken({ serviceRoleClient, userId }),
        );
        result.push(...tracksStillSaved);
      } else {
        let offset = 0;
        while (result.length < outputLength && offset < sourcesAfterActions.length) {
          const tracksToAddLength = Math.min(outputLength - result.length, sourcesAfterActions.length - offset);
          const tracksToAdd = sourcesAfterActions.slice(offset, offset + tracksToAddLength);
          const tracksStillSaved = await attemptSpotifyApiRequest(
            (newToken) =>
              removeTracksNoLongerSaved({
                serviceRoleClient,
                spotifyToken: newToken ?? spotifyToken,
                tracks: tracksToAdd,
                userId,
              }),
            () => refreshSpotifyToken({ serviceRoleClient, userId }),
          );
          offset += tracksToAdd.length;
          result.push(...tracksStillSaved);
        }
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

      if (scheduleId) {
        await serviceRoleClient.functions.invoke('update-module-schedule', {
          body: { scheduleId, isNew: false },
        });
      }

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
