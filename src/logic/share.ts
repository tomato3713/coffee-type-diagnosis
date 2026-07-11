import { FLAVOR_CATEGORIES, RESULT_TYPES } from "../data/results";
import type { FlavorCategoryId } from "../types";

export interface SharedResult {
  typeId: string;
  flavorIds: FlavorCategoryId[];
}

// 例: "t=acid-light-fruity-straight&f=floral,berry"（先頭 ? なし）
export function encodeShareQuery(result: SharedResult): string {
  const params = new URLSearchParams({
    t: result.typeId,
    f: result.flavorIds.join(","),
  });
  return params.toString();
}

// location.search（先頭 ? あり/なし両対応）を受け取り、無効なら null
export function decodeShareQuery(search: string): SharedResult | null {
  const params = new URLSearchParams(search);
  const typeId = params.get("t");
  const flavors = params.get("f");
  if (!typeId || !(typeId in RESULT_TYPES) || !flavors) return null;

  const flavorIds = flavors.split(",");
  const known = new Set(FLAVOR_CATEGORIES.map((c) => c.id));
  if (
    flavorIds.length === 0 ||
    flavorIds.length > 2 ||
    new Set(flavorIds).size !== flavorIds.length ||
    !flavorIds.every((id) => known.has(id as FlavorCategoryId))
  ) {
    return null;
  }
  return { typeId, flavorIds: flavorIds as FlavorCategoryId[] };
}

export function buildShareText(typeName: string): string {
  return `私のコーヒータイプは「${typeName}」でした！ #コーヒータイプ診断`;
}

export function buildShareUrl(baseUrl: string, result: SharedResult): string {
  return `${baseUrl}?${encodeShareQuery(result)}`;
}

export function xIntentUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://x.com/intent/post?${params.toString()}`;
}

export function lineShareUrl(url: string): string {
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
}

// 旧 mixi の mixiチェック。mixi2 にはシェア用 URL がないため、
// mixi2 へは端末の共有シート経由でシェアする
export function mixiShareUrl(url: string): string {
  return `https://mixi.jp/share.pl?u=${encodeURIComponent(url)}`;
}
