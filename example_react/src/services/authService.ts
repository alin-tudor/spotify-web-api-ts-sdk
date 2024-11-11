import SpotifyWebApi from "spotify-web-api-js";
const spotifyApi = new SpotifyWebApi();
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_TARGET!;
const SCOPES = [
  "user-library-read",
  "playlist-read-private",
  "user-read-private",
  "user-read-email",
];

export const getLoginUrl = () => {
  const authEndpoint = "https://accounts.spotify.com/authorize";
  const responseType = "token";
  const scope = SCOPES.join("%20");

  return `${authEndpoint}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}&response_type=${responseType}&show_dialog=true`;
};

export const setAccessToken = (token: string) => {
  spotifyApi.setAccessToken(token);
};

export const getSpotifyApi = () => spotifyApi;
