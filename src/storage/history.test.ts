import { beforeEach, describe, expect, it } from "vitest";
import type { HistoryEntry } from "../types";
import { loadHistory, saveEntry } from "./history";

const STORAGE_KEY = "coffee-type-diagnosis/history";

function createEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    diagnosedAt: "2026-07-11T00:00:00.000Z",
    typeId: "acid-light-fruity-straight",
    flavorIds: ["floral", "berry"],
    baseAnswers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    flavorAnswers: [0, 0, 0],
    ...overrides,
  };
}

// Node 環境なので localStorage をインメモリ実装で差し替える
beforeEach(() => {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
});

describe("loadHistory / saveEntry", () => {
  it("保存したエントリが新しい順で読み込める", () => {
    const first = createEntry();
    const second = createEntry({ typeId: "bitter-rich-nutty-milk" });
    saveEntry(first);
    saveEntry(second);
    expect(loadHistory().map((e) => e.id)).toEqual([second.id, first.id]);
  });

  it("何も保存されていなければ空配列を返す", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("壊れた JSON は空履歴として扱われる", () => {
    localStorage.setItem(STORAGE_KEY, "{broken json");
    expect(loadHistory()).toEqual([]);
  });

  it("未知の version のデータは捨てられる", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, entries: [createEntry()] }),
    );
    expect(loadHistory()).toEqual([]);
  });

  it("未知の typeId のエントリは捨てられる", () => {
    const known = createEntry();
    const unknown = createEntry({ typeId: "no-such-type" });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, entries: [unknown, known] }),
    );
    expect(loadHistory().map((e) => e.id)).toEqual([known.id]);
  });

  it("50件を超えると古いエントリから落ちる", () => {
    for (let i = 0; i < 55; i++) saveEntry(createEntry({ id: `entry-${i}` }));
    const entries = loadHistory();
    expect(entries.length).toBe(50);
    expect(entries[0].id).toBe("entry-54");
    expect(entries.at(-1)?.id).toBe("entry-5");
  });

  it("localStorage が使えなくても例外を投げない", () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    } as unknown as Storage;
    expect(loadHistory()).toEqual([]);
    expect(saveEntry(createEntry()).length).toBe(1);
  });
});
