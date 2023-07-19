import { BAD_SPOTIFY_TOKEN_MESSAGE } from './token-helpers.ts';
import { FetchJSONResponse, PlaylistTracksResponse, SimpleTrack } from './types.ts';

type FetchPlaylistSnapshotIdRequest = {
  spotifyToken: string;
  playlistId: string;
};

export const fetchPlaylistSnapshotId = async ({
  spotifyToken,
  playlistId,
}: FetchPlaylistSnapshotIdRequest): Promise<string | typeof BAD_SPOTIFY_TOKEN_MESSAGE> => {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=snapshot_id`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + spotifyToken,
    },
  });

  const resJson = (await res.json()) as FetchJSONResponse<{ snapshot_id: string }>;
  if (resJson.error) {
    if (resJson.error.status === 401) {
      return BAD_SPOTIFY_TOKEN_MESSAGE;
    } else {
      throw new Error(
        JSON.stringify({
          message: 'Error fetching playlist snapshot id',
          error: resJson.error,
        }),
      );
    }
  }

  return resJson.snapshot_id;
};

type FetchPlaylistTracksRequest = {
  spotifyToken: string;
  playlistId: string;
};

export const fetchPlaylistTracks = async ({
  spotifyToken,
  playlistId,
}: FetchPlaylistTracksRequest): Promise<SimpleTrack[] | typeof BAD_SPOTIFY_TOKEN_MESSAGE> => {
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
