import { MAX_FLAVOR_QUESTION_COUNT } from "../data/questions";
import {
  FLAVOR_CATEGORIES,
  isRoastLevel,
  PROCESS_METHODS,
  RESULT_TYPES,
} from "../data/results";
import type { FlavorCategoryId, ProcessMethodId, RoastLevel } from "../types";

export interface SharedResult {
  typeId: string;
  roast: RoastLevel;
  process: ProcessMethodId;
  flavorIds: FlavorCategoryId[];
}

// アプリ内の画面は "" (トップ) / #/result?t=&f= / #/wheel?t=&f= の
// ハッシュパスで表す。GitHub Pages 等の静的ホスティングでも
// 直接アクセスが 404 にならない
export const RESULT_PATH = "/result";
export const WHEEL_PATH = "/wheel";
export const CUPPING_RESULT_PATH = "/cupping/result";

// location.hash（先頭 # あり/なし両対応）を { path, query } に分解する
export function parseHashRoute(hash: string): { path: string; query: string } {
  const raw = hash.replace(/^#/, "");
  const qIndex = raw.indexOf("?");
  return qIndex === -1
    ? { path: raw, query: "" }
    : { path: raw.slice(0, qIndex), query: raw.slice(qIndex + 1) };
}

export function buildResultHash(result: SharedResult): string {
  return `#${RESULT_PATH}?${encodeShareQuery(result)}`;
}

export function buildWheelHash(result: SharedResult | null): string {
  return result
    ? `#${WHEEL_PATH}?${encodeShareQuery(result)}`
    : `#${WHEEL_PATH}`;
}

// カッピング結果は他人との共有を想定しないため、状態そのものではなく
// この端末の履歴を引くための id だけをクエリに載せる
export function buildCuppingResultHash(entryId: string): string {
  const params = new URLSearchParams({ id: entryId });
  return `#${CUPPING_RESULT_PATH}?${params.toString()}`;
}

export function decodeCuppingResultId(search: string): string | null {
  return new URLSearchParams(search).get("id");
}

// 例: "t=acid-light-fruity-straight&r=2&p=washed&f=floral,berry"（先頭 ? なし）
export function encodeShareQuery(result: SharedResult): string {
  const params = new URLSearchParams({
    t: result.typeId,
    r: String(result.roast),
    p: result.process,
    f: result.flavorIds.join(","),
  });
  return params.toString();
}

// location.search（先頭 ? あり/なし両対応）を受け取り、無効なら null
export function decodeShareQuery(search: string): SharedResult | null {
  const params = new URLSearchParams(search);
  const typeId = params.get("t");
  const roast = Number(params.get("r"));
  const process = params.get("p");
  const flavors = params.get("f");
  if (!typeId || !(typeId in RESULT_TYPES) || !flavors) return null;
  if (!isRoastLevel(roast)) return null;
  if (!process || !(process in PROCESS_METHODS)) return null;

  // フレーバー深掘り質問は各1票なので、結果に出るフレーバー分類は
  // 質問数が最も多い分岐の問題数を超えない
  const flavorIds = flavors.split(",");
  const known = new Set(FLAVOR_CATEGORIES.map((c) => c.id));
  if (
    flavorIds.length === 0 ||
    flavorIds.length > MAX_FLAVOR_QUESTION_COUNT ||
    new Set(flavorIds).size !== flavorIds.length ||
    !flavorIds.every((id) => known.has(id as FlavorCategoryId))
  ) {
    return null;
  }
  return {
    typeId,
    roast,
    process: process as ProcessMethodId,
    flavorIds: flavorIds as FlavorCategoryId[],
  };
}

// url を含めることで、text だけをコピー・転記されても診断結果に
// たどり着けるようにする
export function buildShareText(typeName: string, url: string): string {
  return `私のコーヒータイプは「${typeName}」でした！ #コーヒータイプ診断 ${url}`;
}

export function buildShareUrl(baseUrl: string, result: SharedResult): string {
  return `${baseUrl}${buildResultHash(result)}`;
}

// text に url を含めて渡す（別途 url パラメータを付けると本文中に二重に出る）
export function xIntentUrl(text: string): string {
  const params = new URLSearchParams({ text });
  return `https://x.com/intent/post?${params.toString()}`;
}

// LINE it!（social-plugins.line.me）は URL の OGP プレビューのみで
// 任意のテキストを持てないため、テキストメッセージ共有の URL scheme を使う
export function lineShareUrl(text: string): string {
  return `https://line.me/R/share?text=${encodeURIComponent(text)}`;
}

// 旧 mixi の mixiチェック。mixi2 にはシェア用 URL がないため、
// mixi2 へは端末の共有シート経由でシェアする
export function mixiShareUrl(url: string): string {
  return `https://mixi.jp/share.pl?u=${encodeURIComponent(url)}`;
}
