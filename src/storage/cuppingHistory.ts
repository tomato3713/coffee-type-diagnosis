import { isCuppingScore } from "../data/cupping";
import { isComplete } from "../logic/cupping";
import type { CuppingHistoryEntry } from "../types";

const STORAGE_KEY = "coffee-type-diagnosis/cupping-history";
const MAX_ENTRIES = 50;
const VERSION = 1;

interface StoredCuppingHistory {
  version: typeof VERSION;
  entries: CuppingHistoryEntry[];
}

function isValidEntry(entry: CuppingHistoryEntry): boolean {
  return (
    isComplete(entry.answers) &&
    entry.answers.every((a) => isCuppingScore(a.score))
  );
}

// parse 失敗・version 不一致・不正なエントリ・localStorage 例外はすべて空履歴として扱う
export function loadCuppingHistory(): CuppingHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored: unknown = JSON.parse(raw);
    if (
      typeof stored !== "object" ||
      stored === null ||
      !("version" in stored) ||
      stored.version !== VERSION ||
      !("entries" in stored) ||
      !Array.isArray(stored.entries)
    ) {
      return [];
    }
    return (stored.entries as CuppingHistoryEntry[]).filter(isValidEntry);
  } catch {
    return [];
  }
}

// 同じ id のエントリが既にあれば更新（先頭に移動）、なければ新規追加する
export function saveCuppingEntry(
  entry: CuppingHistoryEntry,
): CuppingHistoryEntry[] {
  const others = loadCuppingHistory().filter((e) => e.id !== entry.id);
  const entries = [entry, ...others].slice(0, MAX_ENTRIES);
  try {
    const stored: StoredCuppingHistory = { version: VERSION, entries };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // プライベートモード等で保存できなくてもカッピング自体は続行できる
  }
  return entries;
}
