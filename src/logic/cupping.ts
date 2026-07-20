import { CUPPING_CRITERIA } from "../data/cupping";
import type { CuppingCriterionAnswer } from "../types";

export const CUPPING_CRITERION_COUNT = CUPPING_CRITERIA.length;

// 8項目すべてに回答済みか（重複なく全項目のIDが揃っているか）を判定する
export function isComplete(answers: CuppingCriterionAnswer[]): boolean {
  if (answers.length !== CUPPING_CRITERION_COUNT) return false;
  const ids = new Set(answers.map((a) => a.criterionId));
  return (
    ids.size === CUPPING_CRITERION_COUNT &&
    CUPPING_CRITERIA.every((c) => ids.has(c.id))
  );
}

export interface CuppingProgress {
  value: number;
  max: number;
}

// 評価画面の進捗バー用。max は常に項目数（8）で固定
export function cuppingProgress(answeredCount: number): CuppingProgress {
  return { value: answeredCount, max: CUPPING_CRITERION_COUNT };
}

// 8項目のスコア合計（8〜80）
export function totalScore(answers: CuppingCriterionAnswer[]): number {
  return answers.reduce((sum, a) => sum + a.score, 0);
}

// 平均スコア（小数1桁に四捨五入）
export function averageScore(answers: CuppingCriterionAnswer[]): number {
  if (answers.length === 0) return 0;
  return Math.round((totalScore(answers) / answers.length) * 10) / 10;
}
