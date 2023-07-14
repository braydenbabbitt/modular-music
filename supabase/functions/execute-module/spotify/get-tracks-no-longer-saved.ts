import { sliceArray } from './../utils/slice-array.ts';
import { BAD_SPOTIFY_TOKEN_MESSAGE } from './token-helpers.ts';
import { SupabaseClient } from 'supabase-js';
import { Database } from '../types/database.ts';
import { SimpleTrack } from '../types/generics.ts';

type GetTracksNoLongerSavedRequest = {
  serviceRoleClient: SupabaseClient<Database>;
  spotifyToken: string;
  tracks: SimpleTrack[];
  userId: string;
};

export const removeTracksNoLongerSaved = async ({
  serviceRoleClient,
  spotifyToken,
  tracks,
  userId,
}: GetTracksNoLongerSavedRequest): Promise<SimpleTrack[] | typeof BAD_SPOTIFY_TOKEN_MESSAGE> => {
  const splitTracks = sliceArray(tracks, 50);
  const result: SimpleTrack[] = [];
  await Promise.all(
    splitTracks.map(async (tracks) => {
      const spotifyResponseQuery = await fetch(
        `https://api.spotify.com/v1/me/tracks/contains?ids=${tracks.map((track) => track.id).join(',')}`,
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + spotifyToken,
          },
        },
      );
      const spotifyResponse = (await spotifyResponseQuery.json()) as boolean[];
      if (Array.isArray(spotifyResponse)) {
        spotifyResponse.forEach((isSaved, index) => {
          if (!isSaved) {
            result.push(tracks[index]);
          }
        });
      }
    }),
  );

  serviceRoleClient.from('users_saved_tracks').delete().eq('user_id', userId).in('track_id', result);

  return tracks.filter((id) => !result.includes(id));
};
