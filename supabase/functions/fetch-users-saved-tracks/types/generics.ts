export type TsPrimitiveName =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function';

export type SpotifyTokenData = {
  token: string;
  expiresAt: number;
};
