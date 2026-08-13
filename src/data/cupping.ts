import type { CuppingCriterionId, CuppingMode, CuppingScore } from "../types";
import vocabulary from "./cuppingVocabulary.json";
import { FLAVOR_CATEGORIES } from "./results";

export interface CuppingCriterionDef {
  id: CuppingCriterionId;
  label: string;
  description: string;
  prompt: string;
  tagOptions: string[];
  // スコアの低い側・高い側の意味を示すラベル
  scoreLowLabel: string;
  scoreHighLabel: string;
}

// flavor/aftertaste 以外は cuppingVocabulary.json の単語をタグ選択肢にする
const VOCABULARY: Record<string, string[]> = vocabulary;

// SCA フレーバーホイールの語彙をそのままタグ選択肢として使う（語彙の二重管理を避ける）
const FLAVOR_WHEEL_TAGS = FLAVOR_CATEGORIES.map((c) => c.label);

// Cup of Excellence カッピングフォームの8項目。この配列の順序が
// 評価画面・結果カードの表示順になる
export const CUPPING_CRITERIA: CuppingCriterionDef[] = [
  {
    id: "clean-cup",
    label: "Clean Cup",
    description: "カップからカップまで、異臭や欠陥のないクリーンさ",
    prompt: "口に含んだとき、雑味や違和感のある香り・味は感じませんか？",
    tagOptions: VOCABULARY["clean-cup"],
    scoreLowLabel: "欠点あり",
    scoreHighLabel: "完全にクリーン",
  },
  {
    id: "sweetness",
    label: "Sweetness",
    description: "感じられる甘さの質と強さ",
    prompt: "どんな甘さを感じますか？強さはどれくらいですか？",
    tagOptions: VOCABULARY.sweetness,
    scoreLowLabel: "甘さなし",
    scoreHighLabel: "甘さ豊か",
  },
  {
    id: "acidity",
    label: "Acidity",
    description: "酸味の質（明るさ・複雑さ）と強さ",
    prompt:
      "酸味はどんな印象ですか？明るく弾けるような酸味か、穏やかな酸味か？",
    tagOptions: VOCABULARY.acidity,
    scoreLowLabel: "酸味弱い",
    scoreHighLabel: "明るく複雑",
  },
  {
    id: "mouthfeel",
    label: "Mouthfeel",
    description: "口に含んだときの質感・重さ・とろみ",
    prompt: "口当たりの重さや質感はどうですか？とろみや軽さを感じますか？",
    tagOptions: VOCABULARY.mouthfeel,
    scoreLowLabel: "水のよう",
    scoreHighLabel: "とろみ・豊か",
  },
  {
    id: "flavor",
    label: "Flavor",
    description: "香りと味が合わさった風味的特徴",
    prompt: "香りと味を合わせて、どんなフレーバーが浮かびますか？",
    tagOptions: FLAVOR_WHEEL_TAGS,
    scoreLowLabel: "特徴なし",
    scoreHighLabel: "複雑で豊か",
  },
  {
    id: "aftertaste",
    label: "Aftertaste",
    description: "飲んだ後に残る余韻の質と長さ",
    prompt: "飲んだ後、どんな風味がどれくらいの長さで残りますか？",
    tagOptions: FLAVOR_WHEEL_TAGS,
    scoreLowLabel: "余韻なし",
    scoreHighLabel: "長く心地よい",
  },
  {
    id: "balance",
    label: "Balance",
    description: "Flavor・Acidity・Mouthfeel・Aftertasteの調和度",
    prompt:
      "これまでの項目は互いに調和していますか？何かが突出していませんか？",
    tagOptions: VOCABULARY.balance,
    scoreLowLabel: "バランス悪い",
    scoreHighLabel: "完璧な調和",
  },
  {
    id: "overall",
    label: "Overall",
    description: "カッパー自身の総合的な好み・印象",
    prompt: "総合的な印象は？もう一度飲みたいと思いますか？",
    tagOptions: VOCABULARY.overall,
    scoreLowLabel: "好みでない",
    scoreHighLabel: "非常に好み",
  },
];

export function findCuppingCriterion(
  id: CuppingCriterionId,
): CuppingCriterionDef {
  const criterion = CUPPING_CRITERIA.find((c) => c.id === id);
  if (!criterion) throw new Error(`unknown cupping criterion: ${id}`);
  return criterion;
}

// 簡易モードで評価する4項目。基本的な味覚三要素（甘味・酸味・質感）と
// 総合印象に絞り、フレーバー深掘りや欠点検出は詳細モードの役割として残す
export const SIMPLE_CUPPING_CRITERION_IDS: CuppingCriterionId[] = [
  "acidity",
  "sweetness",
  "mouthfeel",
  "overall",
];

// 表示順の唯一の正準ソースは CUPPING_CRITERIA。モード別の項目配列は
// そこから filter して作り、二重管理を避ける
export function criteriaForMode(mode: CuppingMode): CuppingCriterionDef[] {
  if (mode === "detailed") return CUPPING_CRITERIA;
  const ids = new Set(SIMPLE_CUPPING_CRITERION_IDS);
  return CUPPING_CRITERIA.filter((c) => ids.has(c.id));
}

export function isCuppingScore(value: number): value is CuppingScore {
  return Number.isInteger(value) && value >= 1 && value <= 10;
}
