import { SimpleTrack } from '../types/generics.ts';
import { sliceArray } from '../utils/slice-array.ts';
import { getUserPlaylistTracks } from './get-sources.ts';
import { BAD_SPOTIFY_TOKEN_MESSAGE, attemptSpotifyApiRequest } from './token-helpers.ts';

export const emptyPlaylist = async (
  spotifyToken: string,
  playlistId: string,
  refreshSpotifyToken: () => Promise<string>,
) => {
  await attemptSpotifyApiRequest(async (newToken?: string) => {
    const playlistTracks = await getUserPlaylistTracks({ spotifyToken: newToken ?? spotifyToken, playlistId });
    if (playlistTracks === BAD_SPOTIFY_TOKEN_MESSAGE) {
      return BAD_SPOTIFY_TOKEN_MESSAGE;
    }
    await removePlaylistItems(playlistId, playlistTracks, newToken ?? spotifyToken, refreshSpotifyToken);
  }, refreshSpotifyToken);
};

export const removePlaylistItems = async (
  playlistId: string,
  items: SimpleTrack[],
  spotifyToken: string,
  refreshSpotifyToken: () => Promise<string>,
) => {
  const slices = sliceArray(items, 100);

  await Promise.all(
    slices.map(async (slice) => {
      await attemptSpotifyApiRequest(async (newToken?: string) => {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + newToken ?? spotifyToken,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            tracks: slice.map((track) => ({ uri: track.uri })),
          }),
        });

        const parsedRes = await res.json();

        if (parsedRes.error || (parsedRes.status && parsedRes.status !== 200)) {
          if (parsedRes.error?.status === 401) {
            return BAD_SPOTIFY_TOKEN_MESSAGE;
          } else {
            throw new Error(
              JSON.stringify({
                message: 'Error deleting tracks from Spotify playlist',
                error: parsedRes.error,
                parsedRes,
                slice,
                playlistId,
              }),
            );
          }
        }
      }, refreshSpotifyToken);
    }),
  );
};

export const writeTracksToPlaylist = async (
  playlistId: string,
  items: SimpleTrack[],
  insert: boolean,
  spotifyToken: string,
  refreshSpotifyToken: () => Promise<string>,
) => {
  const sliceLength = 100;
  const slices = sliceArray(items, sliceLength);

  await Promise.all(
    slices.map(async (slice, index) => {
      const bodyObj: { uris: string[]; position?: number } = {
        uris: slice.map((track) => track.uri),
      };

      if (!insert) {
        bodyObj.position = sliceLength * index;
      }

      await attemptSpotifyApiRequest(async (newToken?: string) => {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + newToken ?? spotifyToken,
            'content-type': 'application/json',
          },
          body: JSON.stringify(bodyObj),
        });

        const parsedRes = await res.json();

        if (parsedRes.error || (parsedRes.status && parsedRes.status !== 200)) {
          if (parsedRes.error.status === 401) {
            return BAD_SPOTIFY_TOKEN_MESSAGE;
          } else {
            throw new Error(
              JSON.stringify({
                message: 'Error adding tracks to Spotify playlist',
                error: parsedRes.error,
                parsedRes,
                slice,
                playlistId,
              }),
            );
          }
        }
      }, refreshSpotifyToken);
    }),
  );
};
