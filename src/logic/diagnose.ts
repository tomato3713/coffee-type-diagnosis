import { FLAVOR_QUESTIONS, QUESTIONS } from "../data/questions";
import { FLAVOR_CATEGORIES, RESULT_TYPES } from "../data/results";
import type {
  AxisId,
  FlavorBranch,
  FlavorCategory,
  ResultType,
} from "../types";

// 各軸のスコア符号とタイプ id の極の対応。プラス側が後者
const AXIS_POLES: Record<AxisId, [string, string]> = {
  taste: ["bitter", "acid"],
  body: ["rich", "light"],
  flavor: ["nutty", "fruity"],
  style: ["milk", "straight"],
};

const AXIS_ORDER: AxisId[] = ["taste", "body", "flavor", "style"];

// answers は QUESTIONS と同順の、選んだ選択肢の index（0 or 1）
export function scoreAxes(answers: number[]): Record<AxisId, number> {
  const scores: Record<AxisId, number> = {
    taste: 0,
    body: 0,
    flavor: 0,
    style: 0,
  };
  QUESTIONS.forEach((question, i) => {
    const choice = question.choices[answers[i]];
    if (!choice)
      throw new Error(`invalid answer for ${question.id}: ${answers[i]}`);
    scores[choice.score.axis] += choice.score.value;
  });
  return scores;
}

// 各軸3問（奇数）なので同点は起きないが、質問数を変えても壊れないよう sum > 0 をプラス側とする
export function typeIdFromScores(scores: Record<AxisId, number>): string {
  return AXIS_ORDER.map(
    (axis) => AXIS_POLES[axis][scores[axis] > 0 ? 1 : 0],
  ).join("-");
}

export function diagnose(answers: number[]): ResultType {
  const id = typeIdFromScores(scoreAxes(answers));
  const result = RESULT_TYPES[id];
  if (!result) throw new Error(`unknown result type: ${id}`);
  return result;
}

export function flavorBranch(answers: number[]): FlavorBranch {
  return scoreAxes(answers).flavor > 0 ? "fruity" : "nutty";
}

// flavorAnswers は FLAVOR_QUESTIONS[branch] と同順の選択肢 index。
// 得票を集計し、上位2分類を返す（同数は FLAVOR_CATEGORIES の定義順を優先）
export function diagnoseFlavor(
  branch: FlavorBranch,
  flavorAnswers: number[],
): FlavorCategory[] {
  const votes = new Map<string, number>();
  FLAVOR_QUESTIONS[branch].forEach((question, i) => {
    const choice = question.choices[flavorAnswers[i]];
    if (!choice)
      throw new Error(`invalid answer for ${question.id}: ${flavorAnswers[i]}`);
    for (const id of choice.votes) votes.set(id, (votes.get(id) ?? 0) + 1);
  });
  return FLAVOR_CATEGORIES.filter((c) => votes.has(c.id))
    .sort((a, b) => (votes.get(b.id) ?? 0) - (votes.get(a.id) ?? 0))
    .slice(0, 2);
}
