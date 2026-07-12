import type {
  FlavorBranch,
  FlavorQuestion,
  ProcessMethodId,
  ProcessQuestion,
  Question,
  RoastQuestion,
} from "../types";

// コーヒーを直接聞かず日常の嗜好で聞くのがこの診断の設計方針。
// 各軸を担当する質問は3問（奇数）にして同点を構造的に避けている。
export const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "お茶を選ぶなら？",
    choices: [
      { label: "爽やかなレモンティー", score: { axis: "taste", value: 1 } },
      { label: "香ばしいほうじ茶", score: { axis: "taste", value: -1 } },
    ],
  },
  {
    id: "q2",
    text: "スープを選ぶなら？",
    choices: [
      { label: "澄んだコンソメスープ", score: { axis: "body", value: 1 } },
      { label: "濃厚なポタージュ", score: { axis: "body", value: -1 } },
    ],
  },
  {
    id: "q3",
    text: "おやつにつまむなら？",
    choices: [
      { label: "ドライフルーツ", score: { axis: "flavor", value: 1 } },
      { label: "ミックスナッツ", score: { axis: "flavor", value: -1 } },
    ],
  },
  {
    id: "q4",
    text: "カフェで注文しがちなのは？",
    choices: [
      { label: "ブラックコーヒー", score: { axis: "style", value: 1 } },
      { label: "カフェラテ", score: { axis: "style", value: -1 } },
    ],
  },
  {
    id: "q5",
    text: "朝の一杯に求める気分は？",
    choices: [
      {
        label: "シャキッと爽やかに目覚めたい",
        score: { axis: "taste", value: 1 },
      },
      {
        label: "じんわり深く落ち着きたい",
        score: { axis: "taste", value: -1 },
      },
    ],
  },
  {
    id: "q6",
    text: "飲み物の余韻はどちらが好き？",
    choices: [
      { label: "スッと消えるすっきり感", score: { axis: "body", value: 1 } },
      { label: "長く残る飲みごたえ", score: { axis: "body", value: -1 } },
    ],
  },
  {
    id: "q7",
    text: "惹かれる香りは？",
    choices: [
      { label: "花や果実の華やかな香り", score: { axis: "flavor", value: 1 } },
      { label: "香ばしいロースト香", score: { axis: "flavor", value: -1 } },
    ],
  },
  {
    id: "q8",
    text: "アイスコーヒーを飲むなら？",
    choices: [
      { label: "急冷ブラックでキリッと", score: { axis: "style", value: 1 } },
      {
        label: "ミルクたっぷりのアイスオレ",
        score: { axis: "style", value: -1 },
      },
    ],
  },
  {
    id: "q9",
    text: "デザートを選ぶなら？",
    choices: [
      {
        label: "ベリーソースのレアチーズケーキ",
        score: { axis: "taste", value: 1 },
      },
      {
        label: "ビターチョコのガトーショコラ",
        score: { axis: "taste", value: -1 },
      },
    ],
  },
  {
    id: "q10",
    text: "お酒（または炭酸飲料）を選ぶなら？",
    choices: [
      {
        label: "軽快なラガーやスパークリング",
        score: { axis: "body", value: 1 },
      },
      { label: "濃厚なスタウトや黒ビール", score: { axis: "body", value: -1 } },
    ],
  },
  {
    id: "q11",
    text: "パンを選ぶなら？",
    choices: [
      { label: "フルーツデニッシュ", score: { axis: "flavor", value: 1 } },
      { label: "チョコクロワッサン", score: { axis: "flavor", value: -1 } },
    ],
  },
  {
    id: "q12",
    text: "一杯とのつきあい方は？",
    choices: [
      {
        label: "素材の個性をそのまま味わいたい",
        score: { axis: "style", value: 1 },
      },
      {
        label: "ミルクや甘みでアレンジも楽しみたい",
        score: { axis: "style", value: -1 },
      },
    ],
  },
];

// 焙煎度を判定する質問。深煎り側の選択肢の重み（4/2/1）は2進の桁に対応し、
// 3問の合計 0〜7 に 1 を足した値が焙煎度（1〜8）になる。
// 回答の組み合わせで8段階すべてに到達できる
export const ROAST_QUESTIONS: RoastQuestion[] = [
  {
    id: "r1",
    text: "トーストの焼き加減は？",
    choices: [
      { label: "うっすら軽めの焼き色", weight: 0 },
      { label: "こんがり濃いめの焼き色", weight: 4 },
    ],
  },
  {
    id: "r2",
    text: "おせんべいを選ぶなら？",
    choices: [
      { label: "あっさり塩味のうす焼き", weight: 0 },
      { label: "濃い口しょうゆの堅焼き", weight: 2 },
    ],
  },
  {
    id: "r3",
    text: "プリンのカラメルは？",
    choices: [
      { label: "甘さを楽しむやさしいカラメル", weight: 0 },
      { label: "ほろ苦い濃いめのカラメル", weight: 1 },
    ],
  },
];

// 精製方法を判定する質問。3問のビット（クリーン/芳醇・甘さ・定番/挑戦）を
// 並べた8通りを PROCESS_BY_ANSWERS で7種の精製方法に対応づける
export const PROCESS_QUESTIONS: ProcessQuestion[] = [
  {
    id: "p1",
    text: "ジュースを選ぶなら？",
    choices: [
      { label: "すっきり澄んだりんごジュース", bit: 0 },
      { label: "果肉感たっぷりの濃厚ジュース", bit: 1 },
    ],
  },
  {
    id: "p2",
    text: "プレーンヨーグルトの食べ方は？",
    choices: [
      { label: "そのまま酸味を楽しむ", bit: 0 },
      { label: "はちみつやジャムで甘みを足す", bit: 1 },
    ],
  },
  {
    id: "p3",
    text: "旅先での食事は？",
    choices: [
      { label: "安心できる定番のお店", bit: 0 },
      { label: "見たことのない料理に挑戦", bit: 1 },
    ],
  },
];

// index は p1 p2 p3 のビットを並べた値（p1 が最上位）。
// 8通りの回答で7種すべての精製方法に到達できる
export const PROCESS_BY_ANSWERS: ProcessMethodId[] = [
  "washed", // 000 クリーン・甘さ控えめ・定番
  "white-honey", // 001 クリーン・甘さ控えめ・挑戦
  "honey", // 010 クリーン・甘みも・定番
  "yellow-honey", // 011 クリーン・甘みも・挑戦
  "sumatra", // 100 芳醇・甘さ控えめ・定番
  "anaerobic", // 101 芳醇・甘さ控えめ・挑戦
  "natural", // 110 芳醇・甘みも・定番
  "anaerobic", // 111 芳醇・甘みも・挑戦
];

// flavor 軸の結果で分岐する深掘り質問。各選択肢はフレーバー中分類に1票を投じる。
// SCA フレーバーホイールの実際の中分類（花2種・果実4種・酸味発酵2種、
// ナッツココア2種・スパイス2種・ロースト3種・甘味3種＝計18種）を
// カバーするため、一部の分類は2問で票を得られるようにしている
export const FLAVOR_QUESTIONS: Record<FlavorBranch, FlavorQuestion[]> = {
  fruity: [
    {
      id: "f1",
      text: "お茶を飲むなら？",
      choices: [
        { label: "ジャスミン茶のような華やかな香り", votes: ["floral"] },
        { label: "アールグレイのような紅茶の渋み", votes: ["black-tea"] },
      ],
    },
    {
      id: "f2",
      text: "果物を選ぶなら？",
      choices: [
        { label: "ブルーベリーやいちご", votes: ["berry"] },
        { label: "オレンジやグレープフルーツ", votes: ["citrus"] },
      ],
    },
    {
      id: "f3",
      text: "食後に果物をつまむなら？",
      choices: [
        {
          label: "レーズンやプルーンのようなドライフルーツ",
          votes: ["dried-fruit"],
        },
        { label: "ぶどうや桃のような生の果実", votes: ["other-fruit"] },
      ],
    },
    {
      id: "f4",
      text: "刺激とコク、より惹かれるのは？",
      choices: [
        { label: "キリッとしたレモンのような酸味", votes: ["sour"] },
        { label: "赤ワインのような芳醇な熟成香", votes: ["fermented"] },
      ],
    },
    {
      id: "f5",
      text: "より惹かれる香りは？",
      choices: [
        { label: "ジャスミンやカモミールの花の香り", votes: ["floral"] },
        { label: "ベリーのような甘酸っぱい香り", votes: ["berry"] },
      ],
    },
  ],
  nutty: [
    {
      id: "n1",
      text: "チョコレートを選ぶなら？",
      choices: [
        { label: "ナッツ入りのミルクチョコ", votes: ["nutty"] },
        { label: "カカオ多めのダークチョコ", votes: ["cocoa"] },
      ],
    },
    {
      id: "n2",
      text: "スパイスを選ぶなら？",
      choices: [
        { label: "シナモンのような温かみのある香り", votes: ["brown-spice"] },
        { label: "こしょうのようなピリッとした刺激", votes: ["pungent"] },
      ],
    },
    {
      id: "n3",
      text: "焙煎の香りで惹かれるのは？",
      choices: [
        { label: "たばこの葉のような渋みある香ばしさ", votes: ["tobacco"] },
        { label: "スモーキーで力強い焦げ感", votes: ["burnt"] },
      ],
    },
    {
      id: "n4",
      text: "朝食を選ぶなら？",
      choices: [
        { label: "香ばしいシリアルやグラノーラ", votes: ["cereal"] },
        { label: "黒糖やキャラメルをかけたパンケーキ", votes: ["brown-sugar"] },
      ],
    },
    {
      id: "n5",
      text: "デザートの香りで惹かれるのは？",
      choices: [
        { label: "バニラアイスのような芳香", votes: ["vanilla"] },
        { label: "何にでも合う優しい甘さ", votes: ["sweet"] },
      ],
    },
    {
      id: "n6",
      text: "好きな甘い香りは？",
      choices: [
        { label: "キャラメルやはちみつのやさしい甘さ", votes: ["brown-sugar"] },
        { label: "バニラのような甘い香り", votes: ["vanilla"] },
      ],
    },
  ],
};

// フレーバー深掘りの分岐のうち質問数が最も多いもの。分岐確定前の
// 進捗見積もりや、結果に含まれるフレーバー分類数の上限に使う
export const MAX_FLAVOR_QUESTION_COUNT = Math.max(
  ...Object.values(FLAVOR_QUESTIONS).map((questions) => questions.length),
);
