import { readFileSync } from 'node:fs';
import { PDFParse } from 'pdf-parse';

export type ParsedChapter = {
  pageEnd: number;
  pageStart: number;
  text: string;
  title: string;
  wordCount: number;
};

export type ParsedPdf = {
  author?: string;
  chapters: ParsedChapter[];
  pageCount: number;
  title: string;
};

const PAGES_PER_CHAPTER = 20;
// Dò tiêu đề chương ở đầu trang: "Chapter 1", "Chương 1", "Part I", "Phần 1"...
const HEADING_PATTERN = /^(chapter|ch[uư][oơ]ng|part|ph[aầ]n)\s+\S+/i;

function firstLine(text: string): string {
  return text.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
}

/**
 * PDF không có cấu trúc chương rõ ràng như EPUB nên phải:
 * 1) Thử dò heading "Chapter N / Chương N" ở đầu mỗi trang.
 * 2) Nếu không đủ heading (< 2), chia đều theo lô 20 trang/chương.
 */
export async function parsePdf(
  filePath: string,
  fallbackTitle: string,
): Promise<ParsedPdf> {
  // pdf-parse chuyển `data` qua worker thread bằng postMessage transfer, nên cần
  // Uint8Array với ArrayBuffer riêng (không phải Buffer pooled) mới transfer được.
  const data = Uint8Array.from(readFileSync(filePath));
  const parser = new PDFParse({ data });
  try {
    // Không được gọi song song trên cùng 1 instance: getInfo()/getText() đều
    // transfer buffer nội bộ cho worker thread, gọi Promise.all làm buffer bị
    // transfer 2 lần và pdfjs ném "Cannot transfer object of unsupported type".
    const info = await parser.getInfo();
    const textResult = await parser.getText();
    const pages = textResult.pages;
    if (pages.length === 0) {
      throw new Error(
        'PDF không có nội dung văn bản (có thể là bản scan hình ảnh)',
      );
    }

    const headingPages = pages.filter((page) =>
      HEADING_PATTERN.test(firstLine(page.text)),
    );

    type Group = { end: number; start: number; title?: string };
    let groups: Group[] = [];
    if (headingPages.length >= 2) {
      groups = headingPages.map((page, index) => ({
        end:
          index + 1 < headingPages.length
            ? headingPages[index + 1].num - 1
            : pages.at(-1)!.num,
        start: page.num,
        title: firstLine(page.text).slice(0, 150),
      }));
      if (headingPages[0].num > 1) {
        groups.unshift({ end: headingPages[0].num - 1, start: 1, title: 'Mở đầu' });
      }
    } else {
      for (let start = 1; start <= pages.length; start += PAGES_PER_CHAPTER) {
        groups.push({ end: Math.min(start + PAGES_PER_CHAPTER - 1, pages.length), start });
      }
    }

    const chapters = groups
      .map((group, index) => {
        const text = pages
          .filter((page) => page.num >= group.start && page.num <= group.end)
          .map((page) => page.text.trim())
          .filter(Boolean)
          .join('\n\n');
        return {
          pageEnd: group.end,
          pageStart: group.start,
          text,
          title: group.title || `Phần ${index + 1} (trang ${group.start}-${group.end})`,
          wordCount: text.split(/\s+/).filter(Boolean).length,
        };
      })
      .filter((chapter) => chapter.text.length > 0);

    if (chapters.length === 0) {
      throw new Error('PDF không trích xuất được nội dung văn bản');
    }

    const meta = (info.info ?? {}) as Record<string, unknown>;
    const rawTitle = (meta.Title as string) || fallbackTitle;
    const authorRaw = meta.Author as string | undefined;

    let title = rawTitle;
    try {
      title = decodeURIComponent(rawTitle);
    } catch {}

    let author = authorRaw;
    try {
      if (authorRaw) author = decodeURIComponent(authorRaw);
    } catch {}

    return {
      author: author?.trim() || undefined,
      chapters,
      pageCount: pages.length,
      title: title.trim() || fallbackTitle,
    };
  } finally {
    await parser.destroy();
  }
}
