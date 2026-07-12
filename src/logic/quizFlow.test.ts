import { describe, expect, it } from "vitest";
import {
  FLAVOR_QUESTIONS,
  MAX_FLAVOR_QUESTION_COUNT,
  PROCESS_QUESTIONS,
  QUESTIONS,
  ROAST_QUESTIONS,
} from "../data/questions";
import type { FlavorBranch } from "../types";
import { quizProgress, splitAnswers, totalQuestionCount } from "./quizFlow";

// 全問 index0 は fruity、全問 index1 は nutty に分岐する
const branchAnswerIndex: Record<FlavorBranch, number> = { fruity: 0, nutty: 1 };

function fullAnswers(branch: FlavorBranch): number[] {
  const index = branchAnswerIndex[branch];
  const total =
    QUESTIONS.length +
    FLAVOR_QUESTIONS[branch].length +
    ROAST_QUESTIONS.length +
    PROCESS_QUESTIONS.length;
  return Array.from({ length: total }, () => index);
}

describe("splitAnswers", () => {
  it("基本質問が完了するまでは後続ステージが空になる", () => {
    const answers = [0, 1, 0];
    expect(splitAnswers(answers)).toEqual({
      baseAnswers: answers,
      flavorAnswers: [],
      roastAnswers: [],
      processAnswers: [],
    });
  });

  it.each([
    "fruity",
    "nutty",
  ] as const)("%s 分岐の全回答をステージ別に分割できる", (branch) => {
    const split = splitAnswers(fullAnswers(branch));
    expect(split.baseAnswers.length).toBe(QUESTIONS.length);
    expect(split.flavorAnswers.length).toBe(FLAVOR_QUESTIONS[branch].length);
    expect(split.roastAnswers.length).toBe(ROAST_QUESTIONS.length);
    expect(split.processAnswers.length).toBe(PROCESS_QUESTIONS.length);
  });

  it("深掘りステージの途中でも回答済み分だけが分割される", () => {
    const answers = [...fullAnswers("fruity").slice(0, QUESTIONS.length), 0, 0];
    const split = splitAnswers(answers);
    expect(split.flavorAnswers).toEqual([0, 0]);
    expect(split.roastAnswers).toEqual([]);
    expect(split.processAnswers).toEqual([]);
  });

  it("分割結果を連結すると元の回答列に戻る", () => {
    for (const branch of ["fruity", "nutty"] as const) {
      const answers = fullAnswers(branch);
      const s = splitAnswers(answers);
      expect([
        ...s.baseAnswers,
        ...s.flavorAnswers,
        ...s.roastAnswers,
        ...s.processAnswers,
      ]).toEqual(answers);
    }
  });
});

describe("totalQuestionCount", () => {
  it("基本質問が完了するまでは null を返す", () => {
    expect(totalQuestionCount([])).toBeNull();
    expect(totalQuestionCount(Array(QUESTIONS.length - 1).fill(0))).toBeNull();
  });

  it.each([
    "fruity",
    "nutty",
  ] as const)("%s 分岐では基本＋深掘り＋焙煎度＋精製方法の合計を返す", (branch) => {
    const answers = fullAnswers(branch);
    expect(totalQuestionCount(answers)).toBe(answers.length);
    // 基本質問が終わった時点でも同じ総数が確定する
    expect(totalQuestionCount(answers.slice(0, QUESTIONS.length))).toBe(
      answers.length,
    );
  });
});

describe("quizProgress", () => {
  it("1問答えるごとに value が1ずつ進み、常に max を超えない", () => {
    for (const branch of ["fruity", "nutty"] as const) {
      const answers = fullAnswers(branch);
      for (let count = 0; count <= answers.length; count++) {
        const progress = quizProgress(answers.slice(0, count));
        expect(progress.value).toBe(count);
        expect(progress.value).toBeLessThanOrEqual(progress.max);
      }
    }
  });

  it("分岐が確定するまでの max は、両分岐のうち質問数が多い方を見積もりとして使う", () => {
    const estimated =
      QUESTIONS.length +
      MAX_FLAVOR_QUESTION_COUNT +
      ROAST_QUESTIONS.length +
      PROCESS_QUESTIONS.length;
    for (let count = 0; count < QUESTIONS.length; count++) {
      expect(quizProgress(Array(count).fill(0)).max).toBe(estimated);
    }
  });

  it.each([
    "fruity",
    "nutty",
  ] as const)("%s は分岐確定後、max が実際の総質問数に切り替わる", (branch) => {
    const answers = fullAnswers(branch);
    for (let count = QUESTIONS.length; count <= answers.length; count++) {
      expect(quizProgress(answers.slice(0, count)).max).toBe(answers.length);
    }
  });
});
