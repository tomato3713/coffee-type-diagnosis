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

export interface ResultType {
  id: string;
  name: string;
  variety: string;
  origin: string;
  brewing: string;
  roast: RoastLevel;
  process: ProcessMethodId;
  description: string;
}

export interface HistoryEntry {
  id: string;
  diagnosedAt: string;
  typeId: string;
  flavorIds: FlavorCategoryId[];
  baseAnswers: number[];
  flavorAnswers: number[];
}
