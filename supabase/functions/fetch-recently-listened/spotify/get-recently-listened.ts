import { PostgrestSingleResponse, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { Database } from '../types/database.ts';
import { SimpleTrack } from '../types/generics.ts';
import { FetchJSONResponse, RecentlyListenedResponse } from './types.ts';

const BAD_SPOTIFY_TOKEN_MESSAGE = 'Invalid spotify token';

export const getRecentlyListened = async (
  supabaseClient: SupabaseClient<Database>,
  spotifyToken: string,
  refreshSpotifyToken: () => Promise<string>,
  userId: string,
  savedRecentlyPlayed: PostgrestSingleResponse<
    Database['public']['Tables']['users_spotify_recently_listened']['Row'] | null
  >,
) =>
  await attemptSourceFetch(
    async (newToken?: string) =>
      await getUserRecentlyListenedTracks(supabaseClient, newToken ?? spotifyToken, userId, savedRecentlyPlayed),
    refreshSpotifyToken,
  );

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

export type RecentlyListenedTracks = SimpleTrack & {
  played_at: string;
};

const getUserRecentlyListenedTracks = async (
  supabaseClient: SupabaseClient<Database>,
  spotifyToken: string,
  userId: string,
  savedRecentlyPlayed: PostgrestSingleResponse<
    Database['public']['Tables']['users_spotify_recently_listened']['Row'] | null
  >,
): Promise<{ items: RecentlyListenedTracks[]; newCursor?: number }> => {
  if (!userId) {
    const user = await supabaseClient.auth.getUser();
    if (!user.data || user.error) {
      throw new Error('Error fetching supabase user');
    }
    userId = user.data.user.id;
  }
  const recentlyListenedTracks = [];
  const afterQuery =
    savedRecentlyPlayed.data && !savedRecentlyPlayed.error && savedRecentlyPlayed.data.cursor
      ? `&after=${savedRecentlyPlayed.data.cursor}`
      : '';
  const nextPageQuery: Response = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=50${afterQuery}`,
    {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + spotifyToken },
    },
  );
  const nextPage = (await nextPageQuery.json()) as FetchJSONResponse<RecentlyListenedResponse>;
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
            uri: trackObj.track.uri || `spotify:track:${trackObj.track.id}`,
            played_at: trackObj.played_at,
          },
        ],
  );
  return {
    items: resultItems,
    newCursor: new Date(mostRecentItem.played_at).getTime(),
  };
};
