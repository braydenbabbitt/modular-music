type FetchPlaylistRequest = {
  spotifyToken: string;
  playlistId: string;
};

export const fetchPlaylist = async ({ spotifyToken, playlistId }: FetchPlaylistRequest) => {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + spotifyToken,
    },
  });
};

type FetchPlaylistTracksRequest = {
  spotifyToken: string;
};

export const fetchPlaylistTracks = async ({ spotifyToken }: FetchPlaylistTracksRequest) => {};
