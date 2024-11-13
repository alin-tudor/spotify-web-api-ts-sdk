import React, { useContext } from "react";
import {
  getLoginUrl,
  setAccessToken,
  // setAccessToken,
  // getSpotifyApi,
} from "./services/authService";

type AuthState = {
  isAuthenticated: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
};
export const AuthContext = React.createContext<AuthState>({
  isAuthenticated: false,
  handleLogin: () => {},
  handleLogout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const hash = window.location.hash;
    let token = localStorage.getItem("spotifyAuthToken");

    console.log("Token:", token);
    console.log("Hash:", hash);

    if (!token && hash) {
      const params = new URLSearchParams(hash.replace("#", ""));
      token = params.get("access_token");
      if (token) {
        localStorage.setItem("spotifyAuthToken", token);
        setAccessToken(token);
        setIsAuthenticated(true);
      }
    } else if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
    }

    window.location.hash = "";
  }, []);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  const handleLogout = () => {
    localStorage.removeItem("spotifyAuthToken");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function AuthHeader() {
  const { isAuthenticated, handleLogin, handleLogout } =
    React.useContext(AuthContext);
  return (
    <header className="App-header">
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </header>
  );
}
