export const BAD_SPOTIFY_TOKEN_MESSAGE = 'Invalid spotify token' as const;

export const attemptSpotifyApiRequest = async <T>(
  spotifyApiRequestFunction: (newToken?: string) => Promise<T | typeof BAD_SPOTIFY_TOKEN_MESSAGE>,
  refreshSpotifyToken: () => Promise<string>,
) => {
  const res = await spotifyApiRequestFunction();
  if (res === BAD_SPOTIFY_TOKEN_MESSAGE) {
    const newToken = await refreshSpotifyToken();
    const refreshedRes = await spotifyApiRequestFunction(newToken);
    if (refreshedRes === BAD_SPOTIFY_TOKEN_MESSAGE) {
      throw new Error(
        JSON.stringify({
          message: 'Invalid refreshed token',
        }),
      );
    }
    return refreshedRes;
  }
  return res;
};
