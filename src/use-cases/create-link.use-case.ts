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
  expiresIn?: string; // '1d', '3d', '7d', '30d'
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
      const existingLink = await this.linkRepository.findByShortCode(shortCode, data.domainId);
      if (existingLink) {
        const now = new Date();
        if (existingLink.expiresAt && existingLink.expiresAt < now) {
          // Link is expired! Auto-recycle it.
          await this.linkRepository.delete(existingLink.id);
        } else {
          // Link is still active. Calculate remaining time for the error message.
          if (!existingLink.expiresAt) {
            throw new Error("Custom alias already in use (Never expires)");
          }
          
          const msRemaining = existingLink.expiresAt.getTime() - now.getTime();
          const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          let timeMsg = "";
          if (days > 0) timeMsg = `${days} day${days > 1 ? 's' : ''}`;
          else if (hours > 0) timeMsg = `${hours} hour${hours > 1 ? 's' : ''}`;
          else timeMsg = "less than an hour";

          throw new Error(`Custom alias already in use. It will expire in ${timeMsg}.`);
        }
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

    // 3. Calculate expiresAt
    let expiresAt: Date | null = null;
    if (data.expiresIn) {
      const days = parseInt(data.expiresIn.replace('d', ''), 10);
      if (!isNaN(days) && days > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }
    }

    // 4. Save to database
    const link = await this.linkRepository.create({
      longUrl: parsedUrl.toString(),
      shortCode: shortCode as string,
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      domain: data.domainId ? { connect: { id: data.domainId } } : undefined,
      expiresAt: expiresAt as Date | undefined,
    });

    // 4. Set to Redis Cache (TODO - to be implemented with Edge Middleware setup)

    return link;
  }
}
