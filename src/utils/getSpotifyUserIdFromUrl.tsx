export const getSpotifyUserIdFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split("/");
      if (path[1] === "user") {
        return path[2];
      }
    } catch {
      return null;
    }
  };