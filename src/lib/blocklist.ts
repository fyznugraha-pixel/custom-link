const blocklistedDomains = [
  "phishing.com",
  "malware.site",
  "spam.org",
  // prevent double shortening
  "bit.ly", 
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly"
];

export function isUrlBlocklisted(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Prevent shortening our own domain (recursive loop)
    // For local dev we can't reliably block localhost if it's used for testing,
    // but in production we'd block the main domain.
    
    // Check if hostname ends with any of the blocklisted domains
    return blocklistedDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch (e) {
    return true; // Invalid URLs are treated as blocklisted
  }
}
