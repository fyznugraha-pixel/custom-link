export async function isGoogleSafeBrowsingClear(url: string): Promise<boolean> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
  
  if (!apiKey) {
    // If the API key is not configured, we bypass the check so the app continues to work.
    return true;
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

  const payload = {
    client: {
      clientId: "fyurl",
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        { url }
      ]
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Google Safe Browsing API error:", await response.text());
      return true; // Fail open (allow URL) so we don't break the app if Google is down
    }

    const data = await response.json();
    
    // If Google returns a 'matches' array, the URL is malicious
    if (data.matches && data.matches.length > 0) {
      return false;
    }

    // No matches = Safe
    return true;
  } catch (error) {
    console.error("Failed to check Google Safe Browsing:", error);
    return true; // Fail open
  }
}
