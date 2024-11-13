export const mapTracks = (tracks: any[]) => {
  console.log("Filtering tracks:", tracks);
  const filtered = tracks.map((track) => {
    return {
      name: track.track.name,
      artist: track.track.artists.map((a: any) => a.name).join(", "),
      album: track.track.album.name,
      added_at: track.added_at,
      album_image: track.track.album.images[0]?.url,
      released_at: track.track.album.release_date,
    };
  });
  return filtered;
};
