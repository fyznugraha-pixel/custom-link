import prisma from "@/lib/prisma";
import { Link, Prisma } from "@prisma/client";

export interface ILinkRepository {
  create(data: Prisma.LinkCreateInput): Promise<Link>;
  findByShortCode(shortCode: string, domainId?: string): Promise<Link | null>;
  checkAliasExists(shortCode: string, domainId?: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  archive(id: string, shortCode: string): Promise<void>;
}

export class LinkRepository implements ILinkRepository {
  async create(data: Prisma.LinkCreateInput): Promise<Link> {
    return prisma.link.create({ data });
  }

  async findByShortCode(shortCode: string, domainId?: string): Promise<Link | null> {
    if (domainId) {
      return prisma.link.findFirst({
        where: {
          domainId,
          shortCode: {
            equals: shortCode,
            mode: 'insensitive'
          }
        },
      });
    }
    
    // For default domain (no custom domain attached)
    return prisma.link.findFirst({
      where: {
        domainId: null,
        shortCode: {
          equals: shortCode,
          mode: 'insensitive'
        }
      },
    });
  }

  async checkAliasExists(shortCode: string, domainId?: string): Promise<boolean> {
    const link = await this.findByShortCode(shortCode, domainId);
    return !!link;
  }

  async delete(id: string): Promise<void> {
    await prisma.link.delete({
      where: { id }
    });
  }

  async archive(id: string, shortCode: string): Promise<void> {
    await prisma.link.update({
      where: { id },
      data: { shortCode: `archived_${shortCode}_${Date.now()}` }
    });
  }
}
