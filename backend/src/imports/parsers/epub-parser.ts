import AdmZip from 'adm-zip';
import { convert as htmlToText } from 'html-to-text';
import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { XMLParser } from 'fast-xml-parser';

import { toArray, textOf } from '../../common/utils/xml';

export type ParsedChapter = {
  text: string;
  title: string;
  wordCount: number;
};

export type ParsedCover = { buffer: Buffer; extension: string } | null;

export type ParsedEpub = {
  author?: string;
  chapters: ParsedChapter[];
  cover: ParsedCover;
  description: string;
  title: string;
};

const xmlParser = new XMLParser({
  attributeNamePrefix: '@_',
  ignoreAttributes: false,
  textNodeName: '#text',
});

function extFromMediaType(mediaType: string): string {
  if (mediaType.includes('png')) return 'png';
  if (mediaType.includes('gif')) return 'gif';
  if (mediaType.includes('webp')) return 'webp';
  return 'jpg';
}

function resolveHref(dir: string, href: string): string {
  const clean = decodeURIComponent(href.split('#')[0] ?? '');
  return posix.normalize(posix.join(dir, clean));
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

/** EPUB là file zip: container.xml -> content.opf (manifest+spine) -> từng chương xhtml. */
export function parseEpub(filePath: string, fallbackTitle: string): ParsedEpub {
  const zip = new AdmZip(readFileSync(filePath));
  const entries = new Map(zip.getEntries().map((entry) => [entry.entryName, entry]));

  const getEntry = (path: string) => {
    const normalized = posix.normalize(path).replace(/^\.\//, '');
    return (
      entries.get(normalized) ??
      [...entries.values()].find((e) => e.entryName.endsWith(normalized))
    );
  };
  const readText = (path: string) => {
    const entry = getEntry(path);
    if (!entry) throw new Error(`Không tìm thấy file trong EPUB: ${path}`);
    return zip.readAsText(entry, 'utf8');
  };

  const containerEntry = getEntry('META-INF/container.xml');
  if (!containerEntry) {
    throw new Error('File EPUB không hợp lệ: thiếu META-INF/container.xml');
  }
  const container = xmlParser.parse(zip.readAsText(containerEntry, 'utf8'));
  const opfPath: string = toArray(container.container?.rootfiles?.rootfile)[0]?.[
    '@_full-path'
  ];
  if (!opfPath) {
    throw new Error('File EPUB không hợp lệ: thiếu rootfile trong container.xml');
  }
  const opfDir = posix.dirname(opfPath);
  const opf = xmlParser.parse(readText(opfPath)).package;
  if (!opf) {
    throw new Error('File EPUB không hợp lệ: thiếu <package> trong content.opf');
  }

  const manifestItems = toArray(opf.manifest?.item).map((item) => ({
    href: resolveHref(opfDir, item['@_href'] ?? ''),
    id: item['@_id'] as string,
    mediaType: (item['@_media-type'] as string) ?? '',
    properties: ((item['@_properties'] as string) ?? '').split(/\s+/),
  }));
  const manifestById = new Map(manifestItems.map((item) => [item.id, item]));

  // --- Metadata (title/author/description) ---
  const metadata = opf.metadata ?? {};
  const title = textOf(metadata['dc:title']) || fallbackTitle;
  const authorRaw = toArray(metadata['dc:creator']);
  const author = authorRaw.map((node) => textOf(node)).filter(Boolean).join(', ');
  const description = stripTags(textOf(metadata['dc:description']));

  // --- Mục lục (title cho từng chương) ---
  const tocHrefToTitle = new Map<string, string>();
  const tocId: string | undefined = opf.spine?.['@_toc'];
  const ncxItem =
    (tocId && manifestById.get(tocId)) ??
    manifestItems.find((item) => item.mediaType === 'application/x-dtbncx+xml');
  if (ncxItem) {
    try {
      const ncx = xmlParser.parse(readText(ncxItem.href));
      for (const navPoint of toArray(ncx.ncx?.navMap?.navPoint)) {
        const href = navPoint.content?.['@_src'];
        const label = textOf(navPoint.navLabel?.text);
        if (href && label) {
          tocHrefToTitle.set(resolveHref(opfDir, href), label.trim());
        }
      }
    } catch {
      // Toc hỏng -> bỏ qua, dùng fallback title theo heading/số thứ tự
    }
  } else {
    const navItem = manifestItems.find((item) => item.properties.includes('nav'));
    if (navItem) {
      try {
        const navHtml = readText(navItem.href);
        const linkPattern = /<a[^>]*href=["']([^"'#]+)[^"']*["'][^>]*>(.*?)<\/a>/gis;
        for (const match of navHtml.matchAll(linkPattern)) {
          const href = resolveHref(opfDir, match[1] ?? '');
          const label = stripTags(match[2] ?? '');
          if (label) tocHrefToTitle.set(href, label);
        }
      } catch {
        // bỏ qua
      }
    }
  }

  // --- Spine: thứ tự đọc thực tế ---
  const spineIds = toArray(opf.spine?.itemref).map((item) => item['@_idref'] as string);
  const chapters: ParsedChapter[] = [];
  let order = 0;
  for (const id of spineIds) {
    const item = manifestById.get(id);
    if (!item) continue;
    if (!/html|xml/.test(item.mediaType) && !/\.x?html?$/i.test(item.href)) continue;
    order += 1;
    const html = readText(item.href);
    const text = htmlToText(html, {
      selectors: [{ format: 'skip', selector: 'img' }],
      wordwrap: false,
    }).trim();
    if (!text) continue;
    const headingMatch = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/is.exec(html);
    const chapterTitle =
      tocHrefToTitle.get(item.href) ??
      (headingMatch ? stripTags(headingMatch[1] ?? '') : '') ??
      `Chương ${order}`;
    chapters.push({
      text,
      title: chapterTitle || `Chương ${order}`,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    });
  }
  if (chapters.length === 0) {
    throw new Error('Không tìm thấy nội dung chương nào trong EPUB');
  }

  // --- Bìa sách ---
  let cover: ParsedCover = null;
  const coverProps = manifestItems.find((item) => item.properties.includes('cover-image'));
  const coverMetaId = toArray(metadata.meta).find(
    (meta) => meta['@_name'] === 'cover',
  )?.['@_content'];
  const coverItem = coverProps ?? (coverMetaId ? manifestById.get(coverMetaId) : undefined);
  if (coverItem) {
    const entry = getEntry(coverItem.href);
    if (entry) {
      cover = { buffer: entry.getData(), extension: extFromMediaType(coverItem.mediaType) };
    }
  }

  return { author: author || undefined, chapters, cover, description, title };
}
