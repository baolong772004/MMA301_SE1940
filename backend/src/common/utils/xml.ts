// Helpers cho output của fast-xml-parser (phần tử đơn không được bọc mảng,
// text node có/không có attribute trả về dạng khác nhau).
export function toArray<T>(value: T | T[] | undefined): T[] {
  if (value == undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function textOf(node: unknown): string {
  if (node == undefined) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return textOf(node[0]);
  if (typeof node === 'object' && '#text' in (node as Record<string, unknown>)) {
    return String((node as Record<string, unknown>)['#text']);
  }
  return '';
}
