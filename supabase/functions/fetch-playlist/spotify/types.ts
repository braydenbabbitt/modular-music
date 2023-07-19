export type Image = {
  url: string;
  height: number | null;
  width: number | null;
};

export type Playlist = {
  collaboration: boolean;
  description: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: {
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
    display_name: string | null;
  };
  public: boolean | null;
  snapshot_id: string;
  tracks;
};
