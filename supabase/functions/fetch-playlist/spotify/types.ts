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

/* Playlists Tracks */

type EpisodeObject = {
  audio_preview_url: string | null;
  description: string;
  html_description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  /** @deprecated This field is deprecated and might be removed in the future. Use the languages field instead */
  language: string;
  name: string;
  release_date: string;
  release_date_precision: string;
  resume_point: {
    fully_played: boolean;
    resume_position_ms: number;
  };
  type: string;
  uri: string;
  restrictions: {
    reason: 'market' | 'product' | 'explicit';
  };
  show: {
    available_markets: string[];
    copyrights: CopyrightObject[];
    description: string;
    html_description: string;
    explicit: boolean;
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    images: ImageObject[];
    is_externally_hosted: boolean;
    languages: string[];
    media_type: string;
    name: string;
    publisher: string;
    type: 'show';
    uri: string;
    total_episodes: number;
  };
};

type PlaylistTrackObject = {
  added_at: string | null;
  added_by: {
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string | null;
      total: number;
    };
    href: string;
    id: string;
    type: 'user';
    uri: string;
  } | null;
  is_local: boolean;
  track: TrackObject | EpisodeObject;
};

export type PlaylistTracksResponse = {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: PlaylistTrackObject[];
};

/* Recently Listened Tracks */

type PlayHistoryObject = {
  track: TrackObject;
  played_at: string;
  context: {
    type: string;
    href: string;
    external_urls: {
      spotify: string;
    };
    uri: string;
  };
};

export type RecentlyListenedResponse = {
  href: string;
  limit: number;
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  total: number;
  items: PlayHistoryObject[];
};

export type SimpleTrack = {
  id: string;
  uri: string;
  fromSavedTracks?: boolean;
};
