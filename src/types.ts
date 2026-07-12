export type AxisId = "taste" | "body" | "flavor" | "style";

export interface Choice {
  label: string;
  score: { axis: AxisId; value: 1 | -1 };
}

export interface Question {
  id: string;
  text: string;
  choices: [Choice, Choice];
}

export type FlavorBranch = "fruity" | "nutty";

export type FlavorCategoryId =
  // 花 (Floral)
  | "floral"
  | "black-tea"
  // 果実 (Fruity)
  | "berry"
  | "dried-fruit"
  | "other-fruit"
  | "citrus"
  // 酸味・発酵 (Sour/Fermented)
  | "sour"
  | "fermented"
  // ロースト (Roasted)
  | "tobacco"
  | "burnt"
  | "cereal"
  // スパイス (Spices)
  | "pungent"
  | "brown-spice"
  // ナッティ・ココア (Nutty/Cocoa)
  | "nutty"
  | "cocoa"
  // 甘味 (Sweet)
  | "brown-sugar"
  | "vanilla"
  | "sweet";

// SCA フレーバーホイール（2016年版）上の位置。大分類 → 中分類 → 具体ノート
export interface FlavorCategory {
  id: FlavorCategoryId;
  wheelCategory: string;
  label: string;
  notes: string[];
}

export interface FlavorChoice {
  label: string;
  votes: FlavorCategoryId[];
}

export interface FlavorQuestion {
  id: string;
  text: string;
  choices: [FlavorChoice, FlavorChoice];
}

// 焙煎度は浅い方から 1（ライトロースト）〜 8（イタリアンロースト）の8段階
export type RoastLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface RoastLevelInfo {
  level: RoastLevel;
  label: string;
  // 焙煎後の豆の色。スケール表示に使う
  color: string;
  description: string;
}

export type ProcessMethodId =
  | "washed"
  | "natural"
  | "honey"
  | "white-honey"
  | "yellow-honey"
  | "sumatra"
  | "anaerobic";

export interface ProcessMethod {
  id: ProcessMethodId;
  label: string;
  description: string;
}

export interface RoastChoice {
  label: string;
  // 深煎り側の選択肢が持つ重み（2進の桁: 4/2/1）。浅煎り側は 0
  weight: number;
}

export interface RoastQuestion {
  id: string;
  text: string;
  choices: [RoastChoice, RoastChoice];
}

export interface ProcessChoice {
  label: string;
  bit: 0 | 1;
}

export interface ProcessQuestion {
  id: string;
  text: string;
  choices: [ProcessChoice, ProcessChoice];
}

// 4軸の組み合わせで決まる16タイプの基本情報
export interface ResultTypeBase {
  id: string;
  name: string;
  variety: string;
  origin: string;
  brewing: string;
  description: string;
}

// 診断結果。焙煎度と精製方法はタイプとは独立に回答から判定されるため、
// タイプ（16）× 焙煎度（8）× 精製方法（7）の全組み合わせが結果になりうる
export interface ResultType extends ResultTypeBase {
  roast: RoastLevel;
  process: ProcessMethodId;
}

export interface HistoryEntry {
  id: string;
  diagnosedAt: string;
  typeId: string;
  roast: RoastLevel;
  process: ProcessMethodId;
  flavorIds: FlavorCategoryId[];
  baseAnswers: number[];
  flavorAnswers: number[];
  roastAnswers: number[];
  processAnswers: number[];
}
