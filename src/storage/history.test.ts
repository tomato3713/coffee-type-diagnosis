import { beforeEach, describe, expect, it } from "vitest";
import type { HistoryEntry } from "../types";
import { loadHistory, saveEntry } from "./history";

const STORAGE_KEY = "coffee-type-diagnosis/history";

function createEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    diagnosedAt: "2026-07-11T00:00:00.000Z",
    typeId: "acid-light-fruity-straight",
    roast: 2,
    process: "washed",
    flavorIds: ["floral", "berry"],
    baseAnswers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    flavorAnswers: [0, 0, 0],
    roastAnswers: [0, 0, 0],
    processAnswers: [0, 0, 0],
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

  it("version が一致しないデータは捨てられる（旧バージョン含む）", () => {
    for (const version of [1, 99]) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version, entries: [createEntry()] }),
      );
      expect(loadHistory()).toEqual([]);
    }
  });

  it("未知の typeId・精製方法・範囲外の焙煎度のエントリは捨てられる", () => {
    const known = createEntry();
    const invalid = [
      createEntry({ typeId: "no-such-type" }),
      createEntry({ process: "no-such-process" as HistoryEntry["process"] }),
      createEntry({ roast: 9 as HistoryEntry["roast"] }),
    ];
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, entries: [...invalid, known] }),
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
