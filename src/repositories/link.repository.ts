import prisma from "@/lib/prisma";
import { Link, Prisma } from "@prisma/client";

export interface ILinkRepository {
  create(data: Prisma.LinkCreateInput): Promise<Link>;
  findByShortCode(shortCode: string, domainId?: string): Promise<Link | null>;
  checkAliasExists(shortCode: string, domainId?: string): Promise<boolean>;
}

export class LinkRepository implements ILinkRepository {
  async create(data: Prisma.LinkCreateInput): Promise<Link> {
    return prisma.link.create({ data });
  }

  async findByShortCode(shortCode: string, domainId?: string): Promise<Link | null> {
    if (domainId) {
      return prisma.link.findUnique({
        where: {
          domainId_shortCode: {
            domainId,
            shortCode,
          },
        },
      });
    }
    
    // For default domain (no custom domain attached)
    return prisma.link.findFirst({
      where: {
        shortCode,
        domainId: null,
      },
    });
  }

  async checkAliasExists(shortCode: string, domainId?: string): Promise<boolean> {
    const link = await this.findByShortCode(shortCode, domainId);
    return !!link;
  }
}
