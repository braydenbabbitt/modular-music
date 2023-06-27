import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { Database } from '../types/database.ts';
import { SimpleTrack } from '../types/generics.ts';
import { FetchJSONResponse, PlaylistTracksResponse, SavedTrackObject, UserTracksResponse } from './types.ts';
import { BAD_SPOTIFY_TOKEN_MESSAGE, attemptSpotifyApiRequest } from './token-helpers.ts';

enum SOURCE_TYPE_MAP {
  USER_PLAYLIST = 'e6273f47-8dfc-485c-b594-0bb4dc80a1d3',
  LIKED_TRACKS = 'c8ccb32b-60b8-4c0e-9685-29063e63e755',
  RECENTLY_LISTENED = 'f27db10a-fcb4-430f-aa24-88059e7aedd3',
}

const MS_IN_DAY = 86400000;

export const getSourcesFromSpotify = async (
  userId: string,
  spotifyToken: string,
  supabaseClient: SupabaseClient<Database>,
  refreshSpotifyToken: () => Promise<string>,
  sources: Database['public']['Tables']['module_sources']['Row'][],
) => {
  return (
    await Promise.all(
      sources.map(async (source) => {
        const typeId = source.type_id as SOURCE_TYPE_MAP;
        switch (typeId) {
          case SOURCE_TYPE_MAP.LIKED_TRACKS:
            try {
              return await attemptSpotifyApiRequest(
                async (newToken?: string) => await getUserLikedTracks(newToken ?? spotifyToken),
                refreshSpotifyToken,
              );
            } catch (error) {
              console.error(error);
            }
            break;
          case SOURCE_TYPE_MAP.USER_PLAYLIST:
            try {
              return await attemptSpotifyApiRequest(
                async (newToken?: string) =>
                  await getUserPlaylistTracks({ spotifyToken: newToken ?? spotifyToken, source }),
                refreshSpotifyToken,
              );
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

const getUserLikedTracks = async (spotifyToken: string): Promise<SimpleTrack[] | typeof BAD_SPOTIFY_TOKEN_MESSAGE> => {
  const userTracks: SavedTrackObject[] = [];
  let nextPageUrl: string | null = 'https://api.spotify.com/v1/me/tracks?limit=50';
  const pagesToRefetch: string[] = [];
  while (nextPageUrl) {
    const nextPageQuery: Response = await fetch(nextPageUrl, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + spotifyToken },
    });
    const nextPage = (await nextPageQuery.json()) as FetchJSONResponse<UserTracksResponse>;
    if (nextPage.error || (nextPageQuery.status && nextPageQuery.status !== 200)) {
      if (nextPage.error?.status === 401) {
        nextPageUrl = null;
        return BAD_SPOTIFY_TOKEN_MESSAGE;
      } else {
        pagesToRefetch.push(nextPageUrl);
        console.error(
          JSON.stringify({
            requestUrl: nextPageUrl,
            error: nextPage.error,
          }),
        );
        const params: URLSearchParams = new URLSearchParams(nextPageUrl);
        const offset = params.get('offset');
        nextPageUrl = nextPageUrl.replace(`offset=${offset}`, `offset=${Number(offset) + 50}`);
      }
    } else {
      nextPageUrl = nextPage.next;
      userTracks.push(...nextPage.items);
    }
  }

  if (pagesToRefetch.length > 0) {
    pagesToRefetch.forEach(async (url) => {
      let retryCount = 0;
      let success = false;
      while (retryCount < RETRY_LIMIT && !success) {
        const pageRetryQuery: Response = await fetch(url, {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + spotifyToken },
        });
        retryCount++;
        const pageRetry = (await pageRetryQuery.json()) as FetchJSONResponse<UserTracksResponse>;
        if (!pageRetry.error && pageRetryQuery.status && pageRetryQuery.status === 200) {
          success = true;
          userTracks.push(...pageRetry.items);
        } else {
          console.error(
            JSON.stringify({
              requestUrl: url,
              error: pageRetry.error,
              retryCount,
            }),
          );
        }
      }
    });
  }

  return userTracks.flatMap((trackObj): SimpleTrack[] =>
    !trackObj.track.id
      ? []
      : [
          {
            id: trackObj.track.id,
            uri: trackObj.track.uri || `spotify:track:${trackObj.track.id}`,
          },
        ],
  );
};

type GetUserPlaylistTracksRequest =
  | {
      spotifyToken: string;
      source: Database['public']['Tables']['module_sources']['Row'];
      playlistId?: never;
    }
  | {
      spotifyToken: string;
      source?: never;
      playlistId: string;
    };

export const getUserPlaylistTracks = async ({
  spotifyToken,
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

  const playlistTracks = [];
  let nextPageUrl: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;
  while (nextPageUrl) {
    const nextPageQuery: Response = await fetch(nextPageUrl, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + spotifyToken },
    });
    const nextPage = (await nextPageQuery.json()) as FetchJSONResponse<PlaylistTracksResponse>;
    if (nextPage.error || (nextPageQuery.status && nextPageQuery.status !== 200)) {
      nextPageUrl = null;

      if (nextPage.error?.status === 401) {
        return BAD_SPOTIFY_TOKEN_MESSAGE;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Error fetching page from Spotify',
            error: nextPage.error,
            nextPageUrl,
          }),
        );
      }
    }
    nextPageUrl = nextPage.next;
    playlistTracks.push(...nextPage.items);
  }
  return playlistTracks.flatMap((trackObj): SimpleTrack[] =>
    !trackObj.track.id || trackObj.is_local
      ? []
      : [
          {
            id: trackObj.track.id,
            uri: trackObj.track.uri || `spotify:track:${trackObj.track.id}`,
          },
        ],
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
