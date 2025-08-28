export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const username = searchParams.get("username");
  const spotifyUserId = searchParams.get("spotifyUserId");

  if (!platform) {
    return new Response(JSON.stringify({ error: "Missing platform" }), { status: 400 });
  }

  if (platform === "github" && !username) {
    return new Response(JSON.stringify({ error: "Missing username for GitHub" }), { status: 400 });
  }

  if (platform === "spotify" && !spotifyUserId) {
    return new Response(JSON.stringify({ error: "Missing Spotify user ID" }), { status: 400 });
  }

  try {
    let responseData: Record<string, any> = {};

    // GitHub API Call
    if (platform === "github" && username) {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

      const userData = await response.json();
      responseData.github = {
        name: userData.name || "",
        username: userData.login || username,
        followers: userData.followers || 0,
        following: userData.following || 0,
        bio: userData.bio || "",
        avatar: userData.avatar_url || "",
      };
    }

    // Spotify API Call
    if (platform === "spotify" && spotifyUserId) {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
      if (!clientId || !clientSecret) {
        return new Response(JSON.stringify({ error: "Missing Spotify client credentials" }), { status: 401 });
      }
    
      // Step 1: Get Access Token
      const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
    
      if (!tokenResponse.ok) {
        throw new Error(`Failed to get Spotify access token: ${tokenResponse.status}`);
      }
    
      const { access_token } = await tokenResponse.json();
    
      // Step 2: Fetch Spotify user data
      const response = await fetch(`https://api.spotify.com/v1/users/${spotifyUserId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
    
      if (!response.ok) throw new Error(`Spotify API error: ${response.status}`);
    
      const spotifyUser = await response.json();
      responseData.spotifyData = {
        displayName: spotifyUser.display_name || "",
        followers: spotifyUser.followers?.total || 0,
        avatar: spotifyUser.images?.[0]?.url || "",
        profileUrl: spotifyUser.external_urls?.spotify || "",
      };
    }
    

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch data" }),
      { status: 500 }
    );
  }
}
