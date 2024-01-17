import { PostgrestSingleResponse } from 'supabase-js';
import { Database } from '../types/database.ts';
import { FetchJSONResponse, RecentlyListenedResponse } from './types.ts';

const BAD_SPOTIFY_TOKEN_MESSAGE = 'Invalid spotify token';

/**
 * Retrieves the recently listened tracks of the authenticated Spotify user.
 * If the request fails due to an expired token, it will try to refresh the token and retry the request.
 * @param spotifyToken - The access token for the authenticated Spotify user.
 * @param refreshSpotifyToken - A function that refreshes the access token for the authenticated Spotify user.
 * @param cursorQuery - The cursor used to paginate the recently played tracks.
 * @returns A Promise that resolves to an object with the recently played tracks and an optional new cursor for pagination.
 */

export const getRecentlyListened = async (
  spotifyToken: string,
  refreshSpotifyToken: () => Promise<string>,
  cursorQuery: PostgrestSingleResponse<
    Database['public']['Tables']['users_spotify_recently_played_cursors']['Row'] | null
  >,
) =>
  await attemptSourceFetch(
    async (newToken?: string) => await getUserRecentlyListenedTracks(newToken ?? spotifyToken, cursorQuery),
    refreshSpotifyToken,
  );

/**
 * Attempts to fetch data from an external source using a specified fetch function. If the fetch fails due to an invalid access token, the function will attempt to refresh the access token using a provided function and try the fetch again with the new token. If the second fetch fails, the function throws an error.
 * @param fetchFunction - A function that returns a promise representing the fetch operation. This function may optionally take a new access token as a string parameter.
 * @param refreshSpotifyToken - A function that returns a promise representing the process of refreshing the Spotify access token.
 * @returns The fetched data if the fetch operation is successful, or an error if both fetch attempts fail.
 */
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

export type RecentlyListenedTracks = {
  id: string;
  played_at: string;
};

/**
 * Retrieves a list of the user's recently played tracks from the Spotify API.
 * @param spotifyToken - A string representing the user's Spotify access token.
 * @param cursorQuery - A cursor query object from a PostgreSQL database that stores the user's most recent cursor position in the Spotify API.
 * @returns An object containing two properties: items - an array of RecentlyListenedTracks objects representing the user's recently played tracks, and newCursor - an optional number representing the new cursor position in the Spotify API. If there are no new items, this property is undefined.
 */
const getUserRecentlyListenedTracks = async (
  spotifyToken: string,
  cursorQuery: PostgrestSingleResponse<
    Database['public']['Tables']['users_spotify_recently_played_cursors']['Row'] | null
  >,
): Promise<{ items: RecentlyListenedTracks[]; newCursor?: number }> => {
  const recentlyListenedTracks = [];
  const afterQuery =
    cursorQuery.data && !cursorQuery.error && cursorQuery.data.after ? `&after=${cursorQuery.data.after}` : '';
  const nextPageQuery: Response = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=50${afterQuery}`,
    {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + spotifyToken },
    },
  );

  const responseText = await nextPageQuery.text();
  const nextPage = responseText.includes('{')
    ? (JSON.parse(responseText) as FetchJSONResponse<RecentlyListenedResponse>)
    : undefined;
  if (!nextPage) {
    console.log('Issue fetching recently listened', { errorMessageFromSpotify: responseText });
    return { items: [] };
  }
  if (nextPage.items.length < 1) {
    return { items: [] };
  }
  const mostRecentItem = nextPage.items[0];
  recentlyListenedTracks.push(...nextPage.items);
  const resultItems = recentlyListenedTracks.flatMap((trackObj): RecentlyListenedTracks[] =>
    !trackObj.track.id
      ? []
      : [
          {
            id: trackObj.track.id,
            played_at: trackObj.played_at,
          },
        ],
  );
  return {
    items: resultItems,
    newCursor: new Date(mostRecentItem.played_at).getTime(),
  };
};
