import { Database } from '../types/database.ts';
import { SimpleTrack } from '../types/generics.ts';
import {
  FetchJSONResponse,
  PlaylistTracksResponse,
  RecentlyListenedResponse,
  SavedTrackObject,
  UserTracksResponse,
} from './types.ts';

enum SOURCE_TYPE_MAP {
  USER_PLAYLIST = 'e6273f47-8dfc-485c-b594-0bb4dc80a1d3',
  LIKED_TRACKS = 'c8ccb32b-60b8-4c0e-9685-29063e63e755',
  RECENTLY_LISTENED = 'f27db10a-fcb4-430f-aa24-88059e7aedd3',
}

const BAD_SPOTIFY_TOKEN_MESSAGE = 'Invalid spotify token';

const MS_IN_DAY = 86400000;

export const getSourcesFromSpotify = async (
  spotifyToken: string,
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
              return await attemptSourceFetch(
                async (newToken?: string) => await getUserLikedTracks(newToken ?? spotifyToken),
                refreshSpotifyToken,
              );
            } catch (error) {
              console.error(error);
            }
            break;
          case SOURCE_TYPE_MAP.USER_PLAYLIST:
            try {
              return await attemptSourceFetch(
                async (newToken?: string) => await getUserPlaylistTracks(newToken ?? spotifyToken, source),
                refreshSpotifyToken,
              );
            } catch (error) {
              console.error(error);
            }
            break;
          case SOURCE_TYPE_MAP.RECENTLY_LISTENED:
            try {
              return await attemptSourceFetch(
                async (newToken?: string) => await getUserRecentlyListenedTracks(newToken ?? spotifyToken, source),
                refreshSpotifyToken,
              );
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

const attemptSourceFetch = async <T>(
  fetchFunction: (newToken?: string) => Promise<T>,
  refreshSpotifyToken: () => Promise<string>,
) => {
  try {
    return await fetchFunction();
  } catch (error) {
    if (error === BAD_SPOTIFY_TOKEN_MESSAGE) {
      const newToken = await refreshSpotifyToken();
      try {
        return await fetchFunction(newToken);
      } catch (error) {
        throw new Error(
          JSON.stringify({
            message: 'Invalid refreshed token',
            error,
          }),
        );
      }
    }
    throw new Error(error);
  }
};

const getUserLikedTracks = async (spotifyToken: string): Promise<SimpleTrack[]> => {
  const userTracks: SavedTrackObject[] = [];
  let nextPageUrl: string | null = 'https://api.spotify.com/v1/me/tracks?limit=50';
  while (nextPageUrl) {
    const nextPageQuery: Response = await fetch(nextPageUrl, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + spotifyToken },
    });
    const nextPage = (await nextPageQuery.json()) as FetchJSONResponse<UserTracksResponse>;
    if (nextPage.error || nextPageQuery.status !== 200) {
      nextPageUrl = null;

      if (nextPage.error?.status === 401) {
        throw new Error(BAD_SPOTIFY_TOKEN_MESSAGE);
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
    userTracks.push(...nextPage.items);
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

const getUserPlaylistTracks = async (
  spotifyToken: string,
  source: Database['public']['Tables']['module_sources']['Row'],
): Promise<SimpleTrack[]> => {
  if (typeof source.options !== 'object' || Array.isArray(source.options) || source.options === null) {
    throw new Error(
      JSON.stringify({
        message: 'Error parsing JSON of user playlist source options',
        source,
      }),
    );
  }

  const { playlist_id } = source.options;
  if (typeof playlist_id !== 'string') {
    throw new Error(
      JSON.stringify({
        message: 'Error parsing playlist_id from source options',
        source,
      }),
    );
  }

  const playlistTracks = [];
  let nextPageUrl: string | null = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=50`;
  while (nextPageUrl) {
    const nextPageQuery: Response = await fetch(nextPageUrl, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + spotifyToken },
    });
    const nextPage = (await nextPageQuery.json()) as FetchJSONResponse<PlaylistTracksResponse>;
    if (nextPage.error || nextPageQuery.status !== 200) {
      nextPageUrl = null;

      if (nextPage.error?.status === 401) {
        throw new Error(BAD_SPOTIFY_TOKEN_MESSAGE);
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
  spotifyToken: string,
  source: Database['public']['Tables']['module_sources']['Row'],
): Promise<SimpleTrack[]> => {
  if (typeof source.options !== 'object' || Array.isArray(source.options) || source.options === null) {
    throw new Error(
      JSON.stringify({
        message: 'Error parsing JSON of recently listened source options',
        source,
      }),
    );
  }

  const { interval, quantity } = source.options;
  if (typeof interval !== 'number') {
    throw new Error(
      JSON.stringify({
        message: 'Error parsing interval from source options',
        source,
      }),
    );
  }
  if (typeof quantity !== 'number') {
    throw new Error(
      JSON.stringify({
        message: 'Error parsing quantity from source options',
        source,
      }),
    );
  }

  const recentlyListenedTracks = [];
  const afterTimestamp = Date.now() - interval * quantity * MS_IN_DAY;
  let nextPageUrl:
    | string
    | null = `https://api.spotify.com/v1/me/player/recently-played?limit=50&after=${afterTimestamp.toString()}`;
  while (nextPageUrl) {
    const nextPageQuery: Response = await fetch(nextPageUrl, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + spotifyToken },
    });
    const nextPage = (await nextPageQuery.json()) as FetchJSONResponse<RecentlyListenedResponse>;
    if (nextPage.error || nextPageQuery.status !== 200) {
      nextPageUrl = null;

      if (nextPage.error?.status === 401) {
        throw new Error(BAD_SPOTIFY_TOKEN_MESSAGE);
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
    const lastItem = nextPage.items.at(-1);
    if (!lastItem || new Date(lastItem.played_at).getTime() < afterTimestamp) {
      nextPageUrl = null;
    } else {
      nextPageUrl = `https://api.spotify.com/v1/me/player/recently-played?limit=50&before=${nextPage.cursors.before}`;
    }
    recentlyListenedTracks.push(...nextPage.items);
  }
  return recentlyListenedTracks.flatMap((trackObj): SimpleTrack[] =>
    !trackObj.track.id || new Date(trackObj.played_at).getTime() < afterTimestamp
      ? []
      : [
          {
            id: trackObj.track.id,
            uri: trackObj.track.uri || `spotify:track:${trackObj.track.id}`,
          },
        ],
  );
};
