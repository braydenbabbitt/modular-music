export type SpotifyApiTokenRequest = {
  grant_type: 'authorization_code';
  code: string;
  redirect_uri: string;
  client_id: string;
  code_verifier: string;
};

export type SpotifyApiTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

export type SpotifyApiRefreshTokenRequest = {
  grant_type: 'refresh_token';
  refresh_token: string;
  client_id: string;
};

export type SpotifyApiRefreshTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};
