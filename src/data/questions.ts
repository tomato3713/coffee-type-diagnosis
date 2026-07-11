import type { FlavorBranch, FlavorQuestion, Question } from "../types";

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

// flavor 軸の結果で分岐する深掘り質問。各選択肢はフレーバー中分類に1票を投じる
export const FLAVOR_QUESTIONS: Record<FlavorBranch, FlavorQuestion[]> = {
  fruity: [
    {
      id: "f1",
      text: "果物を選ぶなら？",
      choices: [
        { label: "ブルーベリーやいちご", votes: ["berry"] },
        { label: "オレンジやグレープフルーツ", votes: ["citrus"] },
      ],
    },
    {
      id: "f2",
      text: "より惹かれる香りは？",
      choices: [
        { label: "ジャスミンやカモミールの花の香り", votes: ["floral"] },
        {
          label: "マンゴーやパッションフルーツの南国の香り",
          votes: ["tropical"],
        },
      ],
    },
    {
      id: "f3",
      text: "果実の甘みはどちらが好き？",
      choices: [
        {
          label: "レーズンや赤ワインのような熟した芳醇さ",
          votes: ["dried-fermented"],
        },
        { label: "摘みたてのようなフレッシュな甘酸っぱさ", votes: ["berry"] },
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
      text: "好きな甘い香りは？",
      choices: [
        { label: "キャラメルやはちみつのやさしい甘さ", votes: ["sweet"] },
        { label: "シナモンなどスパイスの効いた香り", votes: ["spice"] },
      ],
    },
    {
      id: "n3",
      text: "焼き菓子を選ぶなら？",
      choices: [
        { label: "しっかり焼き色の香ばしいビスコッティ", votes: ["roast"] },
        { label: "アーモンドたっぷりのフィナンシェ", votes: ["nutty"] },
      ],
    },
  ],
};
