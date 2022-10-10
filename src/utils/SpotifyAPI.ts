import React from 'react';
import axios, { AxiosResponse } from 'axios';
import { User } from '../hooks/useAuthContext';

const BASE_URL = 'https://api.spotify.com/v1';

export const getUser = async (token: string): Promise<User> => {
  try {
    const user = await axios.get(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return user.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`error message: ${error.message}`);
    } else {
      throw error;
    }
  }
};
