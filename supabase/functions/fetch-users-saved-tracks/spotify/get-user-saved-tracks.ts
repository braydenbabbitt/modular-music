import { BAD_SPOTIFY_TOKEN_MESSAGE } from './helpers.ts';
import { FetchJSONResponse, SavedTrackObject, UserTracksResponse } from './types.ts';

type GetUserSavedTracksRequest = {
  spotifyToken: string;
  initOffset?: number;
  addedAtLimit?: string;
};

const PAGE_LIMIT = 50;
const RETRY_LIMIT = 2;

type GetUserSavedTrackPageRequest = {
  url: string;
  spotifyToken: string;
  // deno-lint-ignore no-explicit-any
  onError: (error: any, url: string) => void;
  onBadToken: (url: string) => void;
};

const getUserSavedTracksPage = async ({
  url,
  spotifyToken,
  onError,
  onBadToken,
}: GetUserSavedTrackPageRequest): Promise<FetchJSONResponse<UserTracksResponse> | undefined> => {
  try {
    const nextPageQuery: Response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + spotifyToken },
    });
    const nextPage = (await nextPageQuery.json()) as FetchJSONResponse<UserTracksResponse>;
    if (nextPage.error || (nextPageQuery.status && nextPageQuery.status !== 200)) {
      if (nextPage.error?.status === 401 || nextPageQuery.status === 401) {
        onBadToken(url);
      } else {
        onError(nextPage.error, url);
      }
    } else {
      return nextPage;
    }
  } catch (err) {
    onError(err, url);
  }
};

export const getUserSavedTracks = async ({
  spotifyToken,
  initOffset = 0,
  addedAtLimit,
}: GetUserSavedTracksRequest): Promise<SavedTrackObject[] | string> => {
  const userTracks: SavedTrackObject[] = [];
  let nextPageUrl: string | null = `https://api.spotify.com/v1/me/tracks?limit=${PAGE_LIMIT}&offset=${initOffset}`;
  const pagesToRefetch: string[] = [];
  while (nextPageUrl) {
    if (addedAtLimit) {
      const lastUserTrack = userTracks.length ? userTracks.at(-1) : undefined;
      if (lastUserTrack && lastUserTrack.added_at <= addedAtLimit) {
        nextPageUrl = null;
        break;
      }
    }
    const nextPage = await getUserSavedTracksPage({
      url: nextPageUrl,
      spotifyToken,
      onError: (error, url) => {
        pagesToRefetch.push(url);
        console.error(
          JSON.stringify({
            requestUrl: url,
            error,
          }),
        );
        const params: URLSearchParams = new URLSearchParams(url);
        const offset = params.get('offset');
        nextPageUrl = url.replace(`offset=${offset}`, `offset=${Number(offset) + PAGE_LIMIT}`);
      },
      onBadToken: (url) => {
        nextPageUrl = null;
        const params: URLSearchParams = new URLSearchParams(url);
        const offset = params.get('offset');
        return `${BAD_SPOTIFY_TOKEN_MESSAGE}:${offset}`;
      },
    });

    if (nextPage) {
      nextPageUrl = nextPage.next;
      userTracks.push(...nextPage.items);
    } else {
      nextPageUrl = null;
    }
  }

  let dontWrite = false;
  if (pagesToRefetch.length) {
    pagesToRefetch.forEach(async (url) => {
      let retryCount = 0;
      let success = false;
      while (!success && retryCount < RETRY_LIMIT) {
        retryCount++;
        const pageRetryQuery = await getUserSavedTracksPage({
          url,
          spotifyToken,
          onError: (error, url) => {
            console.error(
              JSON.stringify({
                requestUrl: url,
                error,
              }),
            );
          },
          onBadToken: () => {
            console.error('bad token during retry');
            dontWrite = true;
          },
        });

        if (pageRetryQuery) {
          success = true;
          userTracks.push(...pageRetryQuery.items);
        }
      }
    });
  }

  if (dontWrite) {
    return [];
  }

  if (addedAtLimit) {
    return userTracks.filter((track) => track.added_at > addedAtLimit);
  }
  return userTracks;
};
