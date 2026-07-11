import type { FlavorCategory, FlavorCategoryId, ResultType } from "../types";

// SCA フレーバーホイール（2016年版）の9大分類のうち、嗜好の診断結果として意味を持つ分類
export const SCA_WHEEL_CATEGORIES = [
  "花 (Floral)",
  "果実 (Fruity)",
  "酸味・発酵 (Sour/Fermented)",
  "甘味 (Sweet)",
  "ナッティ・ココア (Nutty/Cocoa)",
  "スパイス (Spices)",
  "ロースト (Roasted)",
] as const;

// 得票の同数時は定義順が優先される（上にあるほど優先）。
// 深掘り質問で1票しか得られない分類（芳醇・ワイニー系、ロースト系）は
// 同点で埋もれないよう前方に置いている
export const FLAVOR_CATEGORIES: FlavorCategory[] = [
  {
    id: "floral",
    wheelCategory: "花 (Floral)",
    label: "フローラル",
    notes: ["ジャスミン", "カモミール", "ローズ"],
  },
  {
    id: "dried-fermented",
    wheelCategory: "酸味・発酵 (Sour/Fermented)",
    label: "芳醇・ワイニー系",
    notes: ["レーズン", "プルーン", "赤ワインのような風味"],
  },
  {
    id: "berry",
    wheelCategory: "果実 (Fruity)",
    label: "ベリー系",
    notes: ["ブルーベリー", "ラズベリー", "ストロベリー"],
  },
  {
    id: "citrus",
    wheelCategory: "果実 (Fruity)",
    label: "シトラス系",
    notes: ["レモン", "オレンジ", "グレープフルーツ"],
  },
  {
    id: "tropical",
    wheelCategory: "果実 (Fruity)",
    label: "トロピカル系",
    notes: ["マンゴー", "パイナップル", "ピーチ"],
  },
  {
    id: "nutty",
    wheelCategory: "ナッティ・ココア (Nutty/Cocoa)",
    label: "ナッツ系",
    notes: ["アーモンド", "ヘーゼルナッツ", "ピーナッツ"],
  },
  {
    id: "roast",
    wheelCategory: "ロースト (Roasted)",
    label: "ロースト系",
    notes: ["香ばしい穀物", "スモーキー", "カラメリゼ"],
  },
  {
    id: "cocoa",
    wheelCategory: "ナッティ・ココア (Nutty/Cocoa)",
    label: "カカオ系",
    notes: ["ダークチョコレート", "カカオニブ"],
  },
  {
    id: "sweet",
    wheelCategory: "甘味 (Sweet)",
    label: "キャラメル・甘み系",
    notes: ["キャラメル", "はちみつ", "バニラ"],
  },
  {
    id: "spice",
    wheelCategory: "スパイス (Spices)",
    label: "スパイス系",
    notes: ["シナモン", "クローブ", "ナツメグ"],
  },
];

export function findFlavorCategory(id: FlavorCategoryId): FlavorCategory {
  const category = FLAVOR_CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`unknown flavor category: ${id}`);
  return category;
}

// キーは `taste-body-flavor-style` の4極の組み合わせ（2^4 = 16タイプ）
export const RESULT_TYPES: Record<string, ResultType> = {
  "acid-light-fruity-straight": {
    id: "acid-light-fruity-straight",
    name: "華やかシングルオリジン型",
    variety: "エアルーム（エチオピア原種）",
    origin: "エチオピア イルガチェフェ",
    brewing: "浅煎りをペーパードリップで、ブラックのまま",
    description:
      "紅茶のように軽やかで華やかな一杯が似合うタイプ。浅煎りの個性豊かなシングルオリジンをぜひそのまま楽しんで。",
  },
  "acid-light-fruity-milk": {
    id: "acid-light-fruity-milk",
    name: "フルーティカジュアル型",
    variety: "SL28・SL34",
    origin: "ケニア",
    brewing: "水出しアイスコーヒーで。好みで少量のミルクを",
    description:
      "果実感のある明るい味わいを気軽に楽しみたいタイプ。ジューシーなケニアの水出しはミルクとの相性も抜群。",
  },
  "acid-light-nutty-straight": {
    id: "acid-light-nutty-straight",
    name: "ハニークリア型",
    variety: "カトゥーラ（ハニープロセス）",
    origin: "コスタリカ",
    brewing: "中煎りをハンドドリップで丁寧に",
    description:
      "すっきりしつつも甘みのある調和が好きなタイプ。ハニープロセスのやさしい甘さが朝の一杯にぴったり。",
  },
  "acid-light-nutty-milk": {
    id: "acid-light-nutty-milk",
    name: "まろやかスイート型",
    variety: "カトゥアイ",
    origin: "ホンジュラス",
    brewing: "中煎りをアイスラテで",
    description:
      "軽やかな甘みとミルクのまろやかさを楽しむタイプ。クセのない中米のコーヒーはアレンジしても素材の良さが生きる。",
  },
  "acid-rich-fruity-straight": {
    id: "acid-rich-fruity-straight",
    name: "高貴ゲイシャ型",
    variety: "ゲイシャ",
    origin: "パナマ",
    brewing: "中浅煎りをじっくりハンドドリップで",
    description:
      "香りの複雑さと余韻を静かに味わいたい探究者タイプ。世界が注目するゲイシャの華やかさと厚みをぜひ体験して。",
  },
  "acid-rich-fruity-milk": {
    id: "acid-rich-fruity-milk",
    name: "果実まろやか型",
    variety: "ブルボン",
    origin: "ルワンダ",
    brewing: "エアロプレスで。カフェオレにしても好相性",
    description:
      "果実の明るさとコクの両方を求める欲張りタイプ。オレンジのような甘さのルワンダはミルクを入れても輪郭が残る。",
  },
  "acid-rich-nutty-straight": {
    id: "acid-rich-nutty-straight",
    name: "バランス王道型",
    variety: "ブルボン",
    origin: "グアテマラ アンティグア",
    brewing: "中煎りをフレンチプレスで",
    description:
      "酸味・甘み・コクの調和がとれた王道の一杯が好きなタイプ。チョコのような甘さのアンティグアは外さない選択。",
  },
  "acid-rich-nutty-milk": {
    id: "acid-rich-nutty-milk",
    name: "キャラメルラテ型",
    variety: "カスティージョ",
    origin: "コロンビア",
    brewing: "エスプレッソベースのカフェラテで",
    description:
      "キャラメルのような甘さとミルクの一体感を楽しむタイプ。ラテにしたときの完成度はコロンビアの得意分野。",
  },
  "bitter-light-fruity-straight": {
    id: "bitter-light-fruity-straight",
    name: "エキゾチックモカ型",
    variety: "モカ・マタリ（ナチュラル精製）",
    origin: "イエメン",
    brewing: "中深煎りをペーパードリップで",
    description:
      "深みの中に個性的な果実感を求めるロマン派タイプ。独特の芳醇さを持つモカはコーヒーの歴史そのものの味。",
  },
  "bitter-light-fruity-milk": {
    id: "bitter-light-fruity-milk",
    name: "キリマンジャロ爽快型",
    variety: "ブルボン系",
    origin: "タンザニア キリマンジャロ",
    brewing: "急冷アイスコーヒーで。ミルク割りもおすすめ",
    description:
      "しっかりした飲みごたえと爽やかさを両立したいタイプ。野性味ある果実感のキリマンジャロはアイスで映える。",
  },
  "bitter-light-nutty-straight": {
    id: "bitter-light-nutty-straight",
    name: "毎日ブラジル型",
    variety: "ムンドノーボ",
    origin: "ブラジル",
    brewing: "中煎りをマグカップでたっぷりドリップ",
    description:
      "気取らず毎日飲める安定の一杯が好きなタイプ。ナッツのような香ばしさのブラジルはデイリーコーヒーの定番。",
  },
  "bitter-light-nutty-milk": {
    id: "bitter-light-nutty-milk",
    name: "アイスオレ型",
    variety: "カトゥアイ",
    origin: "ブラジル サントス",
    brewing: "アイスカフェオレで",
    description:
      "香ばしさとミルクのやさしさでゴクゴク飲みたいタイプ。ブラジルの甘香ばしさはカフェオレのベースに最適。",
  },
  "bitter-rich-fruity-straight": {
    id: "bitter-rich-fruity-straight",
    name: "個性派マンデリン型",
    variety: "マンデリン（アテン系）",
    origin: "インドネシア スマトラ",
    brewing: "深煎りをフレンチプレスで",
    description:
      "重厚さの中に独特の風味を求める個性派タイプ。アーシーでスパイシーなマンデリンは唯一無二の存在感。",
  },
  "bitter-rich-fruity-milk": {
    id: "bitter-rich-fruity-milk",
    name: "コンデンスリッチ型",
    variety: "ロブスタ",
    origin: "ベトナム",
    brewing: "ベトナム式（練乳入り）で",
    description:
      "ガツンとした苦味を甘さで包む刺激的な一杯が好きなタイプ。力強いロブスタと練乳の組み合わせはクセになる味。",
  },
  "bitter-rich-nutty-straight": {
    id: "bitter-rich-nutty-straight",
    name: "深煎り職人型",
    variety: "深煎りブレンド（マンデリン×ブラジル）",
    origin: "インドネシア・ブラジル",
    brewing: "ネルドリップまたはエスプレッソで",
    description:
      "ビターな余韻をじっくり味わう喫茶店スタイルが似合うタイプ。丁寧に淹れた深煎りの一杯は何よりの贅沢。",
  },
  "bitter-rich-nutty-milk": {
    id: "bitter-rich-nutty-milk",
    name: "濃厚カプチーノ型",
    variety: "深煎りブレンド（コロンビア×ブラジル）",
    origin: "コロンビア・ブラジル",
    brewing: "カプチーノやカフェラテで",
    description:
      "深煎りのコクとミルクの濃厚な一体感を楽しむタイプ。エスプレッソの伝統に忠実なイタリアンスタイルがおすすめ。",
  },
};
