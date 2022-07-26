import axios from 'axios';
import { SpotifyUser } from './types';

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
