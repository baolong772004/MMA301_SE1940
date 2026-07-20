import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

import type { AuthUser } from '../common/decorators/current-user.decorator';

import {
  BookSource,
  ChapterStatus,
  Moderation,
  Shelf,
  Visibility,
} from '../common/constants';
import { AUTHOR_SELECT, toStoryResponse } from '../common/utils/story-mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CHAPTER_META_SELECT } from '../stories/stories.service';
import { parseEpub } from './parsers/epub-parser';
import { parsePdf } from './parsers/pdf-parser';

export const UPLOADS_ROOT = join(process.cwd(), 'uploads');
export const IMPORTS_DIR = join(UPLOADS_ROOT, 'imports');
export const COVERS_DIR = join(UPLOADS_ROOT, 'covers');

for (const dir of [IMPORTS_DIR, COVERS_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

type ParsedChapterLike = {
  pageEnd?: number;
  pageStart?: number;
  text: string;
  title: string;
  wordCount: number;
};

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async importFile(
    file: Express.Multer.File | undefined,
    user: AuthUser,
    baseUrl: string,
  ) {
    if (!file) {
      throw new BadRequestException('Thiếu file để import');
    }
    const ext = extname(file.originalname).toLowerCase();
    const fallbackTitle =
      file.originalname.replace(/\.(epub|pdf)$/i, '').trim() ||
      'Sách chưa đặt tên';

    try {
      if (ext === '.epub') {
        return await this.importEpub(file, fallbackTitle, user, baseUrl);
      }
      if (ext === '.pdf') {
        return await this.importPdf(file, fallbackTitle, user, baseUrl);
      }
      throw new BadRequestException('Chỉ hỗ trợ file .epub hoặc .pdf');
    } catch (error) {
      this.cleanup(file.path);
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : 'Không đọc được file';
      throw new BadRequestException(`Import thất bại: ${message}`);
    }
  }

  private async addToLibrary(storyId: string, userId: string) {
    await this.prisma.libraryEntry.create({
      data: { shelf: Shelf.SAVED, storyId, userId },
    });
  }

  private async buildResponse(storyId: string) {
    const story = await this.prisma.story.findUniqueOrThrow({
      include: { author: { select: AUTHOR_SELECT } },
      where: { id: storyId },
    });
    const chapters = await this.prisma.chapter.findMany({
      orderBy: { index: 'asc' },
      select: CHAPTER_META_SELECT,
      where: { storyId },
    });
    return { ...toStoryResponse(story), chapters };
  }

  /**
   * `authorId` trên Story luôn là user đã import (bắt buộc do FK), không phải tác
   * giả thật của sách -> ghi tên tác giả thật vào đầu description để hiển thị.
   */
  private buildDescription(author?: string, description?: string): string {
    const authorLine = author ? `Tác giả: ${author}` : '';
    if (authorLine && description) return `${authorLine}\n\n${description}`;
    return authorLine || description || '';
  }

  private cleanup(path?: string) {
    if (path && existsSync(path)) {
      try {
        unlinkSync(path);
      } catch {
        // best-effort
      }
    }
  }

  private async createChapters(storyId: string, chapters: ParsedChapterLike[]) {
    const now = new Date();
    await this.prisma.chapter.createMany({
      data: chapters.map((chapter, index) => ({
        content: chapter.text,
        index: index + 1,
        pageEnd: chapter.pageEnd ?? null,
        pageStart: chapter.pageStart ?? null,
        publishedAt: now,
        status: ChapterStatus.PUBLISHED,
        storyId,
        title: chapter.title.slice(0, 150),
        wordCount: chapter.wordCount,
      })),
    });
  }

  private async importEpub(
    file: Express.Multer.File,
    fallbackTitle: string,
    user: AuthUser,
    baseUrl: string,
  ) {
    const parsed = parseEpub(file.path, fallbackTitle);

    let coverUri = '';
    if (parsed.cover) {
      const coverFilename = `${randomUUID()}.${parsed.cover.extension}`;
      writeFileSync(join(COVERS_DIR, coverFilename), parsed.cover.buffer);
      coverUri = `${baseUrl}/uploads/covers/${coverFilename}`;
    }

    const story = await this.prisma.story.create({
      data: {
        authorId: user.id,
        coverUri,
        description: this.buildDescription(parsed.author, parsed.description),
        genres: JSON.stringify([]),
        moderation: Moderation.APPROVED,
        source: BookSource.EPUB,
        sourceFileUri: `${baseUrl}/uploads/imports/${file.filename}`,
        status: 'completed',
        title: parsed.title.slice(0, 120),
        visibility: Visibility.PRIVATE,
      },
    });
    await this.createChapters(story.id, parsed.chapters);
    await this.addToLibrary(story.id, user.id);
    return this.buildResponse(story.id);
  }

  private async importPdf(
    file: Express.Multer.File,
    fallbackTitle: string,
    user: AuthUser,
    baseUrl: string,
  ) {
    const parsed = await parsePdf(file.path, fallbackTitle);

    const story = await this.prisma.story.create({
      data: {
        authorId: user.id,
        description: this.buildDescription(parsed.author),
        genres: JSON.stringify([]),
        moderation: Moderation.APPROVED,
        pageCount: parsed.pageCount,
        source: BookSource.PDF,
        sourceFileUri: `${baseUrl}/uploads/imports/${file.filename}`,
        status: 'completed',
        title: parsed.title.slice(0, 120),
        visibility: Visibility.PRIVATE,
      },
    });
    await this.createChapters(story.id, parsed.chapters);
    await this.addToLibrary(story.id, user.id);
    return this.buildResponse(story.id);
  }
}
