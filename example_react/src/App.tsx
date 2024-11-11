// import React, { useState, useEffect, useCallback } from "react";
// import { useSpotify } from "./hooks/useSpotify";
// import { Page, SavedTrack, Scopes, SpotifyApi } from "../../src";
// import * as XLSX from "xlsx";
// import { setAccessToken } from "./services/authService";

// type AnyObject = { [key: string]: any };

// function flattenObject(
//   obj: AnyObject,
//   parentKey = "",
//   result: AnyObject = {}
// ): AnyObject {
//   for (const key in obj) {
//     const propName = parentKey ? `${parentKey}.${key}` : key;
//     if (typeof obj[key] === "object" && obj[key] !== null) {
//       flattenObject(obj[key], propName, result);
//     } else {
//       result[propName] = obj[key];
//     }
//   }
//   return result;
// }

// function filterFlattenedObject(obj: AnyObject, keys: string[]): AnyObject {
//   const filtered: AnyObject = {};
//   keys.forEach((key) => {
//     if (key in obj) {
//       filtered[key] = obj[key];
//     }
//   });
//   return filtered;
// }

// async function fetchWithRetry<T>(
//   fn: () => Promise<T>,
//   retries = 5,
//   delay = 1000
// ): Promise<T> {
//   try {
//     return await fn();
//   } catch (error: any) {
//     if (error.response && error.response.status === 429 && retries > 0) {
//       const retryAfter = error.response.headers["retry-after"] || delay;
//       await new Promise((res) => setTimeout(res, retryAfter * 1000));
//       return fetchWithRetry(fn, retries - 1, delay * 2);
//     }
//     throw error;
//   }
// }

// async function fetchAllLikedTracks(sdk: SpotifyApi): Promise<SavedTrack[]> {
//   let offset = 0;
//   const limit = 50;
//   let allTracks: SavedTrack[] = [];
//   let hasMore = true;
//   while (hasMore) {
//     const results: Page<SavedTrack> = await fetchWithRetry(() =>
//       sdk.currentUser.tracks.savedTracks(limit, offset)
//     );
//     allTracks = allTracks.concat(results.items);
//     offset += results.items.length;
//     hasMore = results.items.length === limit;
//   }
//   return allTracks;
// }

// const App: React.FC = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [tracks, setTracks] = useState<any[]>([]);
//   useEffect(() => {
//     const hash = window.location.hash;
//     let token = localStorage.getItem("spotifyAuthToken");

//     if (!token && hash) {
//       const params = new URLSearchParams(hash.replace("#", ""));
//       token = params.get("access_token");
//       if (token) {
//         localStorage.setItem("spotifyAuthToken", token);
//         setAccessToken(token);
//         setIsAuthenticated(true);
//       }
//     } else if (token) {
//       setAccessToken(token);
//       setIsAuthenticated(true);
//     }

//     window.location.hash = "";
//   }, []);

//   const sdk = useSpotify(
//     import.meta.env.VITE_SPOTIFY_CLIENT_ID!,
//     import.meta.env.VITE_REDIRECT_TARGET!,
//     Scopes.userLibrary
//   );
//   const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
//   const [allKeys, setAllKeys] = useState<string[]>([]);

//   // React.useEffect(
//   //   () => {
//   //     // fetchData
//   //   },
//   //   [
//   //     // filters
//   //   ]
//   // );

//   useEffect(() => {
//     const fetchData = async () => {
//       const allTracks = await fetchAllLikedTracks(sdk!);
//       const flattenedTracks = allTracks.map((item) => flattenObject(item));
//       const keys = new Set<string>();
//       flattenedTracks.forEach((track) => {
//         Object.keys(track).forEach((key) => keys.add(key));
//       });
//       setAllKeys(Array.from(keys));
//     };
//     fetchData();
//   }, [sdk]);

//   const handleKeyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const options = event.target.options;
//     const selected: string[] = [];
//     for (let i = 0; i < options.length; i++) {
//       if (options[i].selected) {
//         selected.push(options[i].value);
//       }
//     }
//     setSelectedKeys(selected);
//   };

//   const downloadExcel = useCallback(async () => {
//     const allTracks = await fetchAllLikedTracks(sdk!);
//     const flattenedTracks = allTracks.map((item) => flattenObject(item));
//     const filteredTracks = flattenedTracks.map((track) =>
//       filterFlattenedObject(track, selectedKeys)
//     );

//     // Add headers as the first row in the sheet

//     const headers = selectedKeys.reduce((acc, key) => {
//       acc[key] = key;
//       return acc;
//     }, {} as AnyObject);

//     // Convert the data to an Excel sheet
//     const worksheetData = [headers, ...filteredTracks];
//     const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
//       skipHeader: true,
//     });
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Liked Tracks");

//     // Generate and download the Excel file
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "liked-tracks.xlsx";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }, [sdk, selectedKeys]);

//   return (
//     <div>
//       <h1>Spotify Liked Tracks</h1>
//       <div>
//         <label>Select Keys:</label>
//         <select
//           style={{ minWidth: "200px" }}
//           multiple={true}
//           value={selectedKeys}
//           onChange={handleKeyChange}
//         >
//           {allKeys.map((key) => (
//             <option key={key} value={key}>
//               {key}
//             </option>
//           ))}
//         </select>
//       </div>
//       <button onClick={downloadExcel}>Download Excel</button>
//     </div>
//   );
// };

// export default App;
// src/App.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  getLoginUrl,
  setAccessToken,
  getSpotifyApi,
} from "./services/authService";
import { setCache, getCache } from "./services/cacheService";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = localStorage.getItem("spotifyAuthToken");

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

  const fetchTracks = useCallback(async () => {
    const cacheKey = "liked_tracks";
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      setTracks(cachedData);
    } else {
      const spotifyApi = getSpotifyApi();
      const response = await spotifyApi.getMySavedTracks();
      const data = response.items;
      setTracks(data);
      setCache(cacheKey, data, 3600000); // Cache for 1 hour
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTracks();
    }
  }, [isAuthenticated, fetchTracks]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  const handleLogout = () => {
    localStorage.removeItem("spotifyAuthToken");
    setIsAuthenticated(false);
  };

  return (
    <div>
      <h1>Spotify Authentication</h1>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <div>
          <p>You are logged in!</p>
          <button onClick={handleLogout}>Logout</button>
          <div>
            <h2>Liked Tracks</h2>
            <ul>
              {tracks.map((track, index) => (
                <li key={index}>{track.track.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
