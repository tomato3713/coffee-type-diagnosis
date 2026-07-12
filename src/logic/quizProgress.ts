import {
  FLAVOR_QUESTIONS,
  PROCESS_QUESTIONS,
  QUESTIONS,
  ROAST_QUESTIONS,
} from "../data/questions";
import { flavorBranch } from "./diagnose";

export interface QuizProgress {
  value: number;
  max: number;
}

// 深掘り質問数は分岐で変わるため、分岐が確定するまでは最大の分岐を
// 見積もりとして使う（value を後退させないための上限見積もり）
const MAX_FLAVOR_QUESTIONS = Math.max(
  ...Object.values(FLAVOR_QUESTIONS).map((questions) => questions.length),
);

// 質問画面の進捗バーの value/max を、現在の回答状況から導出する。
// value は基本・深掘り・焙煎度・精製方法を通じて回答済みの総数で、常に
// 単調増加する（回答が進む限りリセットされない）。max は分岐が確定する
// までは見積もりを使い、確定後は実際の質問数に切り替わる
export function quizProgress(
  baseAnswers: number[],
  flavorAnswers: number[],
  roastAnswers: number[],
  processAnswers: number[],
): QuizProgress {
  const branchFixed = baseAnswers.length >= QUESTIONS.length;
  const flavorMax = branchFixed
    ? FLAVOR_QUESTIONS[flavorBranch(baseAnswers)].length
    : MAX_FLAVOR_QUESTIONS;
  return {
    value:
      baseAnswers.length +
      flavorAnswers.length +
      roastAnswers.length +
      processAnswers.length,
    max:
      QUESTIONS.length +
      flavorMax +
      ROAST_QUESTIONS.length +
      PROCESS_QUESTIONS.length,
  };
}
