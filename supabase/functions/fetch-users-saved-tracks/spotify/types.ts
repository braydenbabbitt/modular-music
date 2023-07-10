// deno-lint-ignore-file no-explicit-any
export type FetchJSONResponse<T> = T & {
  error?: Record<string, any>;
};

type ImageObject = {
  url: string;
  heigh: string | null;
  width: string | null;
};

type CopyrightObject = {
  text?: string;
  type?: string;
};

type SimplifiedArtistObject = {
  external_urls?: {
    spotify?: string;
  };
  href?: string;
  id?: string;
  name?: string;
  type?: string;
  uri?: string;
};

type ArtistObject = SimplifiedArtistObject & {
  followers?: {
    href?: string | null;
    total?: number;
  };
  genres?: string[];
  images?: ImageObject[];
  popularity?: number;
};

type Album = {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions?: {
    reason: 'market' | 'product' | 'explicit';
  };
  type: string;
  uri: string;
  copyrights?: CopyrightObject[];
  external_ids?: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  genres?: string[];
  label?: string;
  popularity?: number;
  album_group?: string;
  artists: SimplifiedArtistObject[];
};

type TrackObject = {
  album?: Album;
  artists?: ArtistObject[];
  available_markets?: string[];
  disc_number?: number;
  duration_ms?: number;
  explicit?: boolean;
  external_ids?: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  external_urls?: {
    spotify?: string;
  };
  href?: string;
  id?: string;
  is_playable?: boolean;
  linked_from?: Record<string, never>;
  restrictions?: {
    reason: 'market' | 'product' | 'explicit';
  };
  name?: string;
  popularity?: number;
  preview_url?: string | null;
  track_number?: number;
  type?: 'track';
  uri?: string;
  is_local?: boolean;
};

export type SavedTrackObject = {
  added_at: string;
  track: TrackObject;
};

export type UserTracksResponse = {
  href: string;
  limit: string;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SavedTrackObject[];
};
