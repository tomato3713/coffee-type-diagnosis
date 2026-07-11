import { FLAVOR_QUESTIONS, QUESTIONS } from "../data/questions";
import { flavorBranch } from "./diagnose";

export interface QuizProgress {
  value: number;
  max: number;
}

// 質問画面の進捗バーの value/max を、現在の回答状況から導出する。
// 基本質問中は12問中の進み具合、深掘り質問中はその分岐の質問数中の
// 進み具合を返す（深掘りの問題数は分岐で変わるため、ここで一度リセットされる）
export function quizProgress(
  baseAnswers: number[],
  flavorAnswers: number[],
): QuizProgress {
  const inFlavorStage = baseAnswers.length >= QUESTIONS.length;
  if (!inFlavorStage) {
    return { value: baseAnswers.length, max: QUESTIONS.length };
  }
  const flavorQuestions = FLAVOR_QUESTIONS[flavorBranch(baseAnswers)];
  return { value: flavorAnswers.length, max: flavorQuestions.length };
}
