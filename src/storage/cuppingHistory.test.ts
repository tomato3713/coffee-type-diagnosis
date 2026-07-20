import { beforeEach, describe, expect, it } from "vitest";
import { CUPPING_CRITERIA } from "../data/cupping";
import type { CuppingHistoryEntry, CuppingScore } from "../types";
import { loadCuppingHistory, saveCuppingEntry } from "./cuppingHistory";

const STORAGE_KEY = "coffee-type-diagnosis/cupping-history";

function createEntry(
  overrides: Partial<CuppingHistoryEntry> = {},
): CuppingHistoryEntry {
  return {
    id: crypto.randomUUID(),
    cuppedAt: "2026-07-11T00:00:00.000Z",
    coffeeName: "エチオピア イルガチェフェ",
    answers: CUPPING_CRITERIA.map((c) => ({
      criterionId: c.id,
      score: 7 as CuppingScore,
      tags: [],
      note: "",
    })),
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

describe("loadCuppingHistory / saveCuppingEntry", () => {
  it("保存したエントリが新しい順で読み込める", () => {
    const first = createEntry();
    const second = createEntry({ coffeeName: "ブラジル サントス" });
    saveCuppingEntry(first);
    saveCuppingEntry(second);
    expect(loadCuppingHistory().map((e) => e.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("何も保存されていなければ空配列を返す", () => {
    expect(loadCuppingHistory()).toEqual([]);
  });

  it("壊れた JSON は空履歴として扱われる", () => {
    localStorage.setItem(STORAGE_KEY, "{broken json");
    expect(loadCuppingHistory()).toEqual([]);
  });

  it("version が一致しないデータは捨てられる", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, entries: [createEntry()] }),
    );
    expect(loadCuppingHistory()).toEqual([]);
  });

  it("項目数が8件でない、または範囲外スコアを含むエントリは捨てられる", () => {
    const known = createEntry();
    const missingCriterion = createEntry({
      answers: known.answers.slice(0, 7),
    });
    const outOfRangeScore = createEntry({
      answers: known.answers.map((a, i) =>
        i === 0 ? { ...a, score: 11 as CuppingScore } : a,
      ),
    });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        entries: [missingCriterion, outOfRangeScore, known],
      }),
    );
    expect(loadCuppingHistory().map((e) => e.id)).toEqual([known.id]);
  });

  it("50件を超えると古いエントリから落ちる", () => {
    for (let i = 0; i < 55; i++)
      saveCuppingEntry(createEntry({ id: `entry-${i}` }));
    const entries = loadCuppingHistory();
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
    expect(loadCuppingHistory()).toEqual([]);
    expect(saveCuppingEntry(createEntry()).length).toBe(1);
  });
});
