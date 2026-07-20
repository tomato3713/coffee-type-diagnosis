import type { CuppingCriterionId, CuppingScore } from "../types";
import vocabulary from "./cuppingVocabulary.json";
import { FLAVOR_CATEGORIES } from "./results";

export interface CuppingCriterionDef {
  id: CuppingCriterionId;
  label: string;
  description: string;
  prompt: string;
  tagOptions: string[];
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
  },
  {
    id: "sweetness",
    label: "Sweetness",
    description: "感じられる甘さの質と強さ",
    prompt: "どんな甘さを感じますか？強さはどれくらいですか？",
    tagOptions: VOCABULARY.sweetness,
  },
  {
    id: "acidity",
    label: "Acidity",
    description: "酸味の質（明るさ・複雑さ）と強さ",
    prompt:
      "酸味はどんな印象ですか？明るく弾けるような酸味か、穏やかな酸味か？",
    tagOptions: VOCABULARY.acidity,
  },
  {
    id: "mouthfeel",
    label: "Mouthfeel",
    description: "口に含んだときの質感・重さ・とろみ",
    prompt: "口当たりの重さや質感はどうですか？とろみや軽さを感じますか？",
    tagOptions: VOCABULARY.mouthfeel,
  },
  {
    id: "flavor",
    label: "Flavor",
    description: "香りと味が合わさった風味的特徴",
    prompt: "香りと味を合わせて、どんなフレーバーが浮かびますか？",
    tagOptions: FLAVOR_WHEEL_TAGS,
  },
  {
    id: "aftertaste",
    label: "Aftertaste",
    description: "飲んだ後に残る余韻の質と長さ",
    prompt: "飲んだ後、どんな風味がどれくらいの長さで残りますか？",
    tagOptions: FLAVOR_WHEEL_TAGS,
  },
  {
    id: "balance",
    label: "Balance",
    description: "Flavor・Acidity・Mouthfeel・Aftertasteの調和度",
    prompt:
      "これまでの項目は互いに調和していますか？何かが突出していませんか？",
    tagOptions: VOCABULARY.balance,
  },
  {
    id: "overall",
    label: "Overall",
    description: "カッパー自身の総合的な好み・印象",
    prompt: "総合的な印象は？もう一度飲みたいと思いますか？",
    tagOptions: VOCABULARY.overall,
  },
];

export function findCuppingCriterion(
  id: CuppingCriterionId,
): CuppingCriterionDef {
  const criterion = CUPPING_CRITERIA.find((c) => c.id === id);
  if (!criterion) throw new Error(`unknown cupping criterion: ${id}`);
  return criterion;
}

export function isCuppingScore(value: number): value is CuppingScore {
  return Number.isInteger(value) && value >= 1 && value <= 10;
}
