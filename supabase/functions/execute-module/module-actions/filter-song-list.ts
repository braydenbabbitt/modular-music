import { refreshSpotifyToken } from '../spotify/get-token.ts';
import { getSourcesFromSpotify } from './../spotify/get-sources.ts';
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { getActionSources } from '../database-helpers/get-action-sources.ts';
import { Database } from '../types/database.ts';
import { getSpotifyToken } from '../spotify/get-token.ts';
import { SimpleTrack } from '../types/generics.ts';

export const filterSongList = async (
  userId: string,
  serviceRoleClient: SupabaseClient<Database>,
  currentList: SimpleTrack[],
  actionId: string,
) => {
  const filterSources = await getActionSources(serviceRoleClient, actionId);
  const spotifyToken = await getSpotifyToken({ serviceRoleClient, userId });

  const fetchedSources = await getSourcesFromSpotify(
    userId,
    spotifyToken,
    serviceRoleClient,
    async () => await refreshSpotifyToken({ serviceRoleClient, userId }),
    filterSources,
  );

  const trackIdsToFilter = fetchedSources.map((track) => track.id);

  return currentList.filter((track) => !trackIdsToFilter.includes(track.id));
};
