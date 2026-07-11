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
  | "floral"
  | "berry"
  | "citrus"
  | "tropical"
  | "dried-fermented"
  | "nutty"
  | "cocoa"
  | "sweet"
  | "spice"
  | "roast";

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

export interface ResultType {
  id: string;
  name: string;
  variety: string;
  origin: string;
  brewing: string;
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
