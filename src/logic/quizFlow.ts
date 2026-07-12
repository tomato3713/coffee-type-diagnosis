import {
  FLAVOR_QUESTIONS,
  PROCESS_QUESTIONS,
  QUESTIONS,
  ROAST_QUESTIONS,
} from "../data/questions";
import { flavorBranch } from "./diagnose";

export interface StageAnswers {
  baseAnswers: number[];
  flavorAnswers: number[];
  roastAnswers: number[];
  processAnswers: number[];
}

// 前後の質問へ自由に移動できるよう、クイズの回答は全ステージを通した
// 1本の列として持つ。この関数でステージ別の回答に分割する。
// 深掘り質問の分岐は基本質問の回答で決まるため、基本質問が完了する
// まで後続ステージの回答は存在しない
export function splitAnswers(answers: number[]): StageAnswers {
  const baseAnswers = answers.slice(0, QUESTIONS.length);
  if (baseAnswers.length < QUESTIONS.length) {
    return {
      baseAnswers,
      flavorAnswers: [],
      roastAnswers: [],
      processAnswers: [],
    };
  }
  const flavorEnd =
    QUESTIONS.length + FLAVOR_QUESTIONS[flavorBranch(baseAnswers)].length;
  const roastEnd = flavorEnd + ROAST_QUESTIONS.length;
  return {
    baseAnswers,
    flavorAnswers: answers.slice(QUESTIONS.length, flavorEnd),
    roastAnswers: answers.slice(flavorEnd, roastEnd),
    processAnswers: answers.slice(roastEnd),
  };
}

// 分岐確定後の総質問数。基本質問が完了するまでは分岐が決まらず
// 総数も確定しないため null を返す
export function totalQuestionCount(answers: number[]): number | null {
  if (answers.length < QUESTIONS.length) return null;
  return (
    QUESTIONS.length +
    FLAVOR_QUESTIONS[flavorBranch(answers.slice(0, QUESTIONS.length))].length +
    ROAST_QUESTIONS.length +
    PROCESS_QUESTIONS.length
  );
}
