import { describe, expect, it } from "vitest";
import { FLAVOR_QUESTIONS, QUESTIONS } from "../data/questions";
import type { FlavorBranch } from "../types";
import { quizProgress } from "./quizProgress";

// 全問 index0 は fruity、全問 index1 は nutty に分岐する
// （各質問の index0 が +1、index1 が -1 で、flavor 軸の合計符号で決まる）
const branchAnswerIndex: Record<FlavorBranch, number> = { fruity: 0, nutty: 1 };

function simulateProgress(
  branch: FlavorBranch,
): { value: number; max: number }[] {
  const answerIndex = branchAnswerIndex[branch];
  const steps: { value: number; max: number }[] = [];
  const baseAnswers: number[] = [];
  const flavorAnswers: number[] = [];

  for (let i = 0; i < QUESTIONS.length; i++) {
    steps.push(quizProgress(baseAnswers, flavorAnswers));
    baseAnswers.push(answerIndex);
  }
  const flavorQuestionCount = FLAVOR_QUESTIONS[branch].length;
  for (let i = 0; i < flavorQuestionCount; i++) {
    steps.push(quizProgress(baseAnswers, flavorAnswers));
    flavorAnswers.push(answerIndex);
  }
  return steps;
}

describe("quizProgress", () => {
  it("1問答えるごとに value が1ずつ進み、質問全体を通じて後退しない", () => {
    for (const branch of ["fruity", "nutty"] as const) {
      const steps = simulateProgress(branch);
      expect(steps.map((s) => s.value)).toEqual(steps.map((_, i) => i));
    }
  });

  it.each([
    "fruity",
    "nutty",
  ] as const)("%s は最後の回答時点で value が max に一致する（分岐確定後の実際の質問数）", (branch) => {
    const flavorQuestionCount = FLAVOR_QUESTIONS[branch].length;
    const steps = simulateProgress(branch);
    const last = steps[steps.length - 1];
    expect(last.value).toBe(QUESTIONS.length + flavorQuestionCount - 1);
    expect(last.max).toBe(QUESTIONS.length + flavorQuestionCount);
  });

  it("分岐が確定するまでの max は、両分岐のうち質問数が多い方を見積もりとして使う", () => {
    const maxFlavorQuestionCount = Math.max(
      ...Object.values(FLAVOR_QUESTIONS).map((qs) => qs.length),
    );
    for (const branch of ["fruity", "nutty"] as const) {
      const steps = simulateProgress(branch).slice(0, QUESTIONS.length);
      expect(
        steps.every((s) => s.max === QUESTIONS.length + maxFlavorQuestionCount),
      ).toBe(true);
    }
  });

  it("max は分岐確定後、減ることはあっても value を追い越されない", () => {
    for (const branch of ["fruity", "nutty"] as const) {
      const steps = simulateProgress(branch);
      for (const step of steps) {
        expect(step.value).toBeLessThanOrEqual(step.max);
      }
    }
  });
});
