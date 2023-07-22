import axios from 'axios';
import { SpotifyUser } from './types';
import { useAuth } from '../auth/auth.provider';

axios.interceptors.response.use(undefined, (error) => {
  if (error.status === 401) {
    const { supabaseClient } = useAuth();
    return supabaseClient.auth.refreshSession();
  }
});

export const getUser = (access_token: string) => {
  return axios
    .get<SpotifyUser>('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('Error getting user data');
      }
    });
};

export const getUserPlaylists = async (access_token: string) => {
  const result = [];
  let nextPageUrl = 'https://api.spotify.com/v1/me/playlists';
  while (nextPageUrl) {
    const nextPage = await axios
      .get(nextPageUrl, {
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
        baseURL: '',
      })
      .then((response) => {
        if (response.status === 200) {
          nextPageUrl = response.data.next;
          return response.data.items;
        }
      });
    result.push(...nextPage);
  }
  return result;
};

type CreatePlaylistOptions = {
  playlistName: string;
  playlistDescription?: string;
  playlistImage?: string;
};

export const createPlaylist = async (
  access_token: string,
  { playlistName, playlistDescription, playlistImage }: CreatePlaylistOptions,
) => {
  const spotifyUser = await getUser(access_token);

  if (spotifyUser?.id) {
    const newPlaylist = await axios.post(
      `https://api.spotify.com/v1/users/${spotifyUser.id}/playlists`,
      {
        name: playlistName,
        description: playlistDescription,
      },
      {
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
      },
    );

    if (playlistImage && newPlaylist.data) {
      await putImageToPlaylist(access_token, newPlaylist.data.id, playlistImage);
    }

    return newPlaylist;
  }
};

export const putImageToPlaylist = async (access_token: string, playlistId: string, imagePayload: string) => {
  await axios.put(`https://api.spotify.com/v1/playlists/${playlistId}/images`, imagePayload, {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  });
};

export const getPlaylist = async (access_token: string, playlistId: string) => {
  return await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  });
};
