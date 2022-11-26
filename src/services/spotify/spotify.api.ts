import axios from 'axios';
import { SpotifyUser } from '../auth/types';

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
