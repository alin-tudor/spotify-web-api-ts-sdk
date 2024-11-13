import { mapTracks } from "./utils";
import React from "react";
import { getSpotifyApi } from "./services/authService";
import { downloadExcelWithImages } from "./excel";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import styled from "styled-components";

const SPOTIFY_LIMIT = 50;

const Album = ({ name, image }: { name: string; image: string }) => (
  <AlbumRow>
    <AlbumImage src={image} />
    {name}
  </AlbumRow>
);

const AlbumRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: row;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  height: 100vh;
  width: 80vw;
  overflow: auto;
`;

const AlbumImage = styled.img`
  width: 100px;
  height: 100px;
`;
export default function LikedTracks() {
  const { ref, inView } = useInView();
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["liked-tracks"],
    queryFn: async ({ pageParam = 0 }) => {
      const spotifyApi = getSpotifyApi();

      const response = await spotifyApi.getMySavedTracks({
        limit: SPOTIFY_LIMIT,
        offset: pageParam,
      });
      return response;
    },
    getNextPageParam: (lastPage) =>
      lastPage.next ? lastPage.offset + SPOTIFY_LIMIT : null,
    getPreviousPageParam: (firstPage) =>
      firstPage.previous ? firstPage.offset - SPOTIFY_LIMIT : null,
  });

  const tracks = (data?.pages ?? []).flatMap((page) => page.items);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const downloadAllTracks = async () => {
    const allTracks = [];

    while (true) {
      const response = await getSpotifyApi().getMySavedTracks({
        limit: 50,
        offset: allTracks.length,
      });
      allTracks.push(...response.items);
      if (!response.next) {
        break;
      }
    }
    return allTracks;
  };

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  const downloadExcel = async () => {
    setIsDownloading(true);
    const tracks = await downloadAllTracks();
    downloadExcelWithImages(mapTracks(tracks));
    setIsDownloading(false);
  };

  return (
    <Wrapper>
      <h1>Spotify Liked Tracks</h1>

      <button onClick={() => downloadExcel()} disabled={isDownloading}>
        {isDownloading ? "Downloading..." : "Download Excel"}
      </button>
      {status === "loading" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <span>Error: {(error as Error).message}</span>
      ) : (
        <>
          {tracks.map((track) => (
            <div ref={ref} key={track.track.id}>
              <Album
                name={track.track.name}
                image={track.track.album.images[0].url}
              />
            </div>
          ))}
          <div>
            <button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load Newer"
                : "Nothing more to load"}
            </button>
          </div>
          <div>
            {isFetching && !isFetchingNextPage
              ? "Background Updating..."
              : null}
          </div>
        </>
      )}
    </Wrapper>
  );
}
