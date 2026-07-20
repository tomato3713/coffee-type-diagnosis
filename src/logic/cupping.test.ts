import { describe, expect, it } from "vitest";
import { CUPPING_CRITERIA } from "../data/cupping";
import type { CuppingCriterionAnswer, CuppingScore } from "../types";
import {
  averageScore,
  CUPPING_CRITERION_COUNT,
  cuppingProgress,
  isComplete,
  totalScore,
} from "./cupping";

// 全8項目に同じスコアを振った回答セットを作る
function answersWithScore(score: CuppingScore): CuppingCriterionAnswer[] {
  return CUPPING_CRITERIA.map((c) => ({
    criterionId: c.id,
    score,
    tags: [],
    note: "",
  }));
}

describe("totalScore", () => {
  it("8項目それぞれのスコアを合計する", () => {
    expect(totalScore(answersWithScore(6))).toBe(48);
  });

  it("回答が空なら0になる", () => {
    expect(totalScore([])).toBe(0);
  });
});

describe("averageScore", () => {
  it("スコアの平均を小数1桁に丸めて返す", () => {
    const answers = answersWithScore(7);
    answers[0].score = 8;
    // (8 + 7*7) / 8 = 7.125 → 7.1
    expect(averageScore(answers)).toBe(7.1);
  });

  it("回答が空なら0になる", () => {
    expect(averageScore([])).toBe(0);
  });
});

describe("isComplete", () => {
  it("8件未満のときは false になる", () => {
    expect(isComplete(answersWithScore(5).slice(0, 7))).toBe(false);
  });

  it("8件すべての項目IDが揃っているときは true になる", () => {
    expect(isComplete(answersWithScore(5))).toBe(true);
  });

  it("項目IDが重複しているときは false になる", () => {
    const answers = answersWithScore(5);
    answers[7] = { ...answers[0] };
    expect(isComplete(answers)).toBe(false);
  });
});

describe("cuppingProgress", () => {
  it("value に渡した回答数、max に項目数を返す", () => {
    expect(cuppingProgress(3)).toEqual({
      value: 3,
      max: CUPPING_CRITERION_COUNT,
    });
  });
});
