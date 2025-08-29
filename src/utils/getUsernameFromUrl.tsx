export const getUsernameFromUrl = (platform: string, url: string) => {
    try {
      const urlObj = new URL(url);
      switch (platform) {
        case "github":
          return urlObj.pathname.split("/")[1]; // e.g. github.com/johndoe → johndoe
        case "twitter":
          return urlObj.pathname.split("/")[1];
        case "instagram":
          return urlObj.pathname.split("/")[1];
        case "youtube":
          return urlObj.pathname.split("/")[1].slice(1);
        case "medium":
          return urlObj.pathname.split("/")[1];
        default:
          return null;
      }
    } catch {
      return null;
    }
  };
  