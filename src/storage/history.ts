import { RESULT_TYPES } from "../data/results";
import type { HistoryEntry } from "../types";

const STORAGE_KEY = "coffee-type-diagnosis/history";
const MAX_ENTRIES = 50;
const VERSION = 1;

interface StoredHistory {
  version: typeof VERSION;
  entries: HistoryEntry[];
}

// parse 失敗・version 不一致・未知 typeId・localStorage 例外はすべて空履歴として扱う
export function loadHistory(): HistoryEntry[] {
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
    return (stored.entries as HistoryEntry[]).filter(
      (e) => e.typeId in RESULT_TYPES,
    );
  } catch {
    return [];
  }
}

export function saveEntry(entry: HistoryEntry): HistoryEntry[] {
  const entries = [entry, ...loadHistory()].slice(0, MAX_ENTRIES);
  try {
    const stored: StoredHistory = { version: VERSION, entries };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // プライベートモード等で保存できなくても診断自体は続行できる
  }
  return entries;
}
