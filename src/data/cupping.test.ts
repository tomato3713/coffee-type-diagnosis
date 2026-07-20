import { describe, expect, it } from "vitest";
import type { CuppingCriterionId } from "../types";
import {
  CUPPING_CRITERIA,
  findCuppingCriterion,
  isCuppingScore,
} from "./cupping";
import { FLAVOR_CATEGORIES } from "./results";

describe("CUPPING_CRITERIA", () => {
  it("Cup of Excellence カッピングフォームの8項目を重複なく含む", () => {
    const expected: CuppingCriterionId[] = [
      "clean-cup",
      "sweetness",
      "acidity",
      "mouthfeel",
      "flavor",
      "aftertaste",
      "balance",
      "overall",
    ];
    expect(CUPPING_CRITERIA.map((c) => c.id)).toEqual(expected);
  });

  it("各項目のタグ選択肢が1つ以上ある", () => {
    for (const criterion of CUPPING_CRITERIA) {
      expect(criterion.tagOptions.length).toBeGreaterThan(0);
    }
  });

  it("flavor と aftertaste のタグ選択肢はSCAフレーバーホイールの語彙と一致する", () => {
    const wheelLabels = FLAVOR_CATEGORIES.map((c) => c.label);
    const flavor = CUPPING_CRITERIA.find((c) => c.id === "flavor");
    const aftertaste = CUPPING_CRITERIA.find((c) => c.id === "aftertaste");
    expect(flavor?.tagOptions).toEqual(wheelLabels);
    expect(aftertaste?.tagOptions).toEqual(wheelLabels);
  });
});

describe("findCuppingCriterion", () => {
  it("既知のIDに対応する項目を返す", () => {
    expect(findCuppingCriterion("balance").label).toBe("Balance");
  });

  it("未知のIDでは例外を投げる", () => {
    expect(() => findCuppingCriterion("unknown" as CuppingCriterionId)).toThrow(
      /unknown cupping criterion/,
    );
  });
});

describe("isCuppingScore", () => {
  it("1〜10の整数は真になる", () => {
    for (let v = 1; v <= 10; v++) expect(isCuppingScore(v)).toBe(true);
  });

  it("範囲外の値は偽になる", () => {
    expect(isCuppingScore(0)).toBe(false);
    expect(isCuppingScore(11)).toBe(false);
  });

  it("整数でない値は偽になる", () => {
    expect(isCuppingScore(5.5)).toBe(false);
  });
});
