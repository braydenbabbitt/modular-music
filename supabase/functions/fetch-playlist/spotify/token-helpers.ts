export const BAD_SPOTIFY_TOKEN_MESSAGE = 'Invalid spotify token' as const;

/**
 * Attempts to execute a spotify api request function, and if the token is invalid, refreshes the token and tries again
 * @param spotifyApiRequestFunction - A function that makes a spotify api request, and returns BAD_SPOTIFY_TOKEN_MESSAGE if the token is invalid
 * @param refreshSpotifyToken - A function that refreshes the spotify token
 * @returns The result of the spotify api request function
 */
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
