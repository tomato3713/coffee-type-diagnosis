import type { CuppingCriterionDef } from "../data/cupping";
import { CUPPING_CRITERIA } from "../data/cupping";
import type { CuppingCriterionAnswer, CuppingMode } from "../types";

// mode 未設定（旧データ）は detailed として扱う。以後 entry.mode を
// 直接見る箇所は作らず、必ずこの関数経由で判定する
export function cuppingModeOf(entry: { mode?: CuppingMode }): CuppingMode {
  return entry.mode ?? "detailed";
}

// criteria の項目すべてに回答済みか（重複なく全項目のIDが揃っているか）を判定する。
// criteria省略時は既存の詳細8項目で検証する（後方互換のデフォルト）
export function isComplete(
  answers: CuppingCriterionAnswer[],
  criteria: CuppingCriterionDef[] = CUPPING_CRITERIA,
): boolean {
  if (answers.length !== criteria.length) return false;
  const ids = new Set(answers.map((a) => a.criterionId));
  return ids.size === criteria.length && criteria.every((c) => ids.has(c.id));
}

export interface CuppingProgress {
  value: number;
  max: number;
}

// 評価画面の進捗バー用。max はモードの項目数（詳細8/簡易4）
export function cuppingProgress(
  answeredCount: number,
  max: number,
): CuppingProgress {
  return { value: answeredCount, max };
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

// 各項目で選択したタグから、感想を1文に組み立てる。選択したタグが
// 1つもなければ空文字を返し、呼び出し側で非表示にできるようにする
export function composeCuppingSummary(
  answers: CuppingCriterionAnswer[],
): string {
  const tags = answers.flatMap((a) => a.tags);
  if (tags.length === 0) return "";
  return `${tags.join("、")}と感じる一杯でした。`;
}
