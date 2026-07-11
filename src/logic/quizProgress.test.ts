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
  it("基本質問に1問答えるごとに value が1ずつ進む", () => {
    const steps = simulateProgress("fruity").slice(0, QUESTIONS.length);
    expect(steps.map((s) => s.value)).toEqual(
      Array.from({ length: QUESTIONS.length }, (_, i) => i),
    );
    expect(steps.every((s) => s.max === QUESTIONS.length)).toBe(true);
  });

  it.each([
    "fruity",
    "nutty",
  ] as const)("%s の深掘り質問に1問答えるごとに value が1ずつ進み、基本質問からの境目で0に戻る", (branch) => {
    const flavorQuestionCount = FLAVOR_QUESTIONS[branch].length;
    const steps = simulateProgress(branch).slice(QUESTIONS.length);
    expect(steps.map((s) => s.value)).toEqual(
      Array.from({ length: flavorQuestionCount }, (_, i) => i),
    );
    expect(steps.every((s) => s.max === flavorQuestionCount)).toBe(true);
  });

  it("回答を進めるだけで value が後戻りすることはない（分岐の境目を除く）", () => {
    for (const branch of ["fruity", "nutty"] as const) {
      const steps = simulateProgress(branch);
      for (let i = 1; i < steps.length; i++) {
        const sameStage = steps[i].max === steps[i - 1].max;
        if (sameStage) {
          expect(steps[i].value).toBe(steps[i - 1].value + 1);
        } else {
          // 基本質問から深掘り質問へ切り替わった直後は 0 から再開する
          expect(steps[i].value).toBe(0);
        }
      }
    }
  });
});
