const blocklistedDomains = [
  "phishing.com",
  "malware.site",
  "spam.org",
  "ngrok.io",
  "loca.lt",
  "serveo.net",
  // disposable/free domains often abused
  ".tk", ".ml", ".ga", ".cf", ".gq",
  // prevent double shortening
  "bit.ly", 
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly"
];

const blocklistedKeywords = [
  "login",
  "bank",
  "secure",
  "verify",
  "password",
  "auth",
  "update-account",
  "verification"
];

export function isUrlBlocklisted(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const fullUrl = url.toLowerCase();
    
    // Check for malicious keywords anywhere in the URL
    if (blocklistedKeywords.some(keyword => fullUrl.includes(keyword))) {
      return true;
    }
    
    // Check if hostname ends with any of the blocklisted domains
    return blocklistedDomains.some(domain => 
      hostname === domain || hostname.endsWith(domain.startsWith('.') ? domain : `.${domain}`)
    );
  } catch (e) {
    return true; // Invalid URLs are treated as blocklisted
  }
}
