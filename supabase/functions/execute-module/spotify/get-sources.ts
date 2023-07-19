import { SupabaseClient } from 'supabase-js';
import { Database } from '../types/database.ts';
import { SimpleTrack } from '../types/generics.ts';
import { BAD_SPOTIFY_TOKEN_MESSAGE } from './token-helpers.ts';

enum SOURCE_TYPE_MAP {
  USER_PLAYLIST = 'e6273f47-8dfc-485c-b594-0bb4dc80a1d3',
  LIKED_TRACKS = 'c8ccb32b-60b8-4c0e-9685-29063e63e755',
  RECENTLY_LISTENED = 'f27db10a-fcb4-430f-aa24-88059e7aedd3',
}

const MS_IN_DAY = 86400000;

export const getSourcesFromSpotify = async (
  userId: string,
  supabaseClient: SupabaseClient<Database>,
  sources: Database['public']['Tables']['module_sources']['Row'][],
) => {
  return (
    await Promise.all(
      sources.map(async (source) => {
        const typeId = source.type_id as SOURCE_TYPE_MAP;
        switch (typeId) {
          case SOURCE_TYPE_MAP.LIKED_TRACKS:
            return await getUserLikedTracks(supabaseClient, userId);
          case SOURCE_TYPE_MAP.USER_PLAYLIST:
            try {
              return await getUserPlaylistTracks({ serviceRoleClient: supabaseClient, userId, source });
            } catch (error) {
              console.error(error);
            }
            break;
          case SOURCE_TYPE_MAP.RECENTLY_LISTENED:
            try {
              const currentDate = new Date().getTime();
              if (typeof source.options !== 'object' || Array.isArray(source.options) || source.options === null) {
                console.error('Error parsing source options', source.options);
                return [];
              }
              const msToSubtract =
                (Number(source.options.interval) ?? 1) * (Number(source.options.quantity) ?? 1) * MS_IN_DAY;
              return await getUserRecentlyListenedTracks(supabaseClient, userId, new Date(currentDate - msToSubtract));
            } catch (error) {
              console.error(error);
            }
            break;
        }
        return [];
      }),
    )
  ).flat();
};

const RETRY_LIMIT = 2;

const getUserLikedTracks = async (
  serviceRoleClient: SupabaseClient<Database>,
  userId: string,
): Promise<SimpleTrack[]> => {
  let userTracks = await serviceRoleClient.functions.invoke<string[]>('fetch-users-saved-tracks', {
    body: { userId },
  });

  for (let i = 0; i < RETRY_LIMIT && (userTracks.error || userTracks.data === null); i++) {
    const retryResult = await serviceRoleClient.functions.invoke<string[]>('fetch-users-saved-tracks', {
      body: { userId },
    });
    if (retryResult.data && !retryResult.error) {
      userTracks = retryResult;
    }
  }

  return (
    userTracks.data?.map(
      (id): SimpleTrack => ({
        id,
        uri: `spotify:track:${id}`,
        fromSavedTracks: true,
      }),
    ) ?? []
  );
};

type GetUserPlaylistTracksRequest =
  | {
      serviceRoleClient: SupabaseClient<Database>;
      userId: string;
      source: Database['public']['Tables']['module_sources']['Row'];
      playlistId?: never;
    }
  | {
      serviceRoleClient: SupabaseClient<Database>;
      userId: string;
      source?: never;
      playlistId: string;
    };

export const getUserPlaylistTracks = async ({
  serviceRoleClient,
  userId,
  source,
  playlistId,
}: GetUserPlaylistTracksRequest): Promise<SimpleTrack[] | typeof BAD_SPOTIFY_TOKEN_MESSAGE> => {
  if (source) {
    if (typeof source.options !== 'object' || Array.isArray(source.options) || source.options === null) {
      throw new Error(
        JSON.stringify({
          message: 'Error parsing JSON of user playlist source options',
          source,
        }),
      );
    }
    const parsedId = source.options.playlist_id;
    if (typeof parsedId !== 'string') {
      throw new Error(
        JSON.stringify({
          message: 'Error parsing playlist_id from source options',
          error: source,
        }),
      );
    }
    playlistId = parsedId;
  }

  if (playlistId === undefined) {
    throw new Error('invalid playlist id');
  }

  const playlistTracks = await serviceRoleClient.functions.invoke<string[]>('fetch-playlist', {
    body: { playlistId, userId },
  });

  if (playlistTracks.error) {
    throw new Error(
      JSON.stringify({
        message: 'error fetching playlist tracks',
        error: playlistTracks.error,
      }),
    );
  }

  return (
    playlistTracks.data?.map((id): SimpleTrack => ({ id, uri: `spotify:track:${id}`, fromSavedTracks: false })) ?? []
  );
};

const getUserRecentlyListenedTracks = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  after: Date,
): Promise<SimpleTrack[]> => {
  const fetchedTracks = await supabaseClient
    .from('users_spotify_recently_played_items')
    .select()
    .eq('user_id', userId)
    .filter('played_at', 'gte', after.toISOString());

  if (fetchedTracks.error) {
    throw new Error(
      JSON.stringify({
        message: 'error fetching user recently played items',
        error: fetchedTracks.error,
      }),
    );
  }

  return fetchedTracks.data.map((item) => ({ id: item.track_id, uri: `spotify:track:${item.track_id}` }));
};
