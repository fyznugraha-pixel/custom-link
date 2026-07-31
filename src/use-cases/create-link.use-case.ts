import { ILinkRepository } from "@/repositories/link.repository";

function generateShortCode(length = 7): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface CreateLinkDTO {
  longUrl: string;
  customAlias?: string;
  userId?: string;
  domainId?: string;
}

export class CreateLinkUseCase {
  constructor(private linkRepository: ILinkRepository) {}

  async execute(data: CreateLinkDTO) {
    // 1. Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(data.longUrl);
    } catch (e) {
      throw new Error("Invalid URL provided");
    }

    // 2. Determine short code
    let shortCode = data.customAlias;
    
    if (shortCode) {
      // Validate alias format
      if (!/^[a-zA-Z0-9-_]+$/.test(shortCode)) {
        throw new Error("Invalid custom alias format (only alphanumeric, dash, underscore)");
      }
      
      // Check collision
      const exists = await this.linkRepository.checkAliasExists(shortCode, data.domainId);
      if (exists) {
        throw new Error("Custom alias already in use");
      }
    } else {
      // Generate unique short code fallback
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        shortCode = generateShortCode();
        const exists = await this.linkRepository.checkAliasExists(shortCode, data.domainId);
        if (!exists) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error("Failed to generate a unique short code. Please try again.");
      }
    }

    // 3. Save to database
    const link = await this.linkRepository.create({
      longUrl: parsedUrl.toString(),
      shortCode: shortCode as string,
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      domain: data.domainId ? { connect: { id: data.domainId } } : undefined,
    });

    // 4. Set to Redis Cache (TODO - to be implemented with Edge Middleware setup)

    return link;
  }
}
