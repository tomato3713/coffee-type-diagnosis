import type {
  FlavorCategory,
  FlavorCategoryId,
  ProcessMethod,
  ProcessMethodId,
  ResultType,
  RoastLevel,
  RoastLevelInfo,
} from "../types";

// 焙煎度の8段階。color は焙煎後の豆の色の目安で、スケール表示に使う
export const ROAST_LEVELS: RoastLevelInfo[] = [
  {
    level: 1,
    label: "ライトロースト",
    color: "#d9b98f",
    description: "最も浅い焙煎。強い酸味と生豆に近い香り",
  },
  {
    level: 2,
    label: "シナモンロースト",
    color: "#c69f6c",
    description: "シナモン色の浅煎り。すっきりした酸味が際立つ",
  },
  {
    level: 3,
    label: "ミディアムロースト",
    color: "#ae8250",
    description: "中浅煎り。明るい酸味と豆本来の華やかな風味",
  },
  {
    level: 4,
    label: "ハイロースト",
    color: "#93653a",
    description: "中煎り。酸味と甘みのバランスがとれた飲みやすさ",
  },
  {
    level: 5,
    label: "シティロースト",
    color: "#764c28",
    description: "中深煎り。苦味とコクが出はじめる定番の焙煎",
  },
  {
    level: 6,
    label: "フルシティロースト",
    color: "#5a371b",
    description: "中深煎り。しっかりした苦味とコク。アイスにも好適",
  },
  {
    level: 7,
    label: "フレンチロースト",
    color: "#402312",
    description: "深煎り。強い苦味と香ばしさ。ミルクに負けない力強さ",
  },
  {
    level: 8,
    label: "イタリアンロースト",
    color: "#2a150a",
    description: "最も深い焙煎。濃厚な苦味とスモーキーな余韻",
  },
];

export function findRoastLevel(level: RoastLevel): RoastLevelInfo {
  const roast = ROAST_LEVELS.find((r) => r.level === level);
  if (!roast) throw new Error(`unknown roast level: ${level}`);
  return roast;
}

export const PROCESS_METHODS: Record<ProcessMethodId, ProcessMethod> = {
  washed: {
    id: "washed",
    label: "ウォッシュト",
    description:
      "果肉を除去し水洗いしてから乾燥させる方法。クリーンで明るい酸味に仕上がる",
  },
  natural: {
    id: "natural",
    label: "ナチュラル",
    description:
      "果実がついたまま天日乾燥させる伝統的な方法。豊かな果実感と甘みが生まれる",
  },
  honey: {
    id: "honey",
    label: "ハニー",
    description:
      "果肉を除いたあと粘液質（ミュシレージ）を残して乾燥させる方法。やさしい甘みが特徴",
  },
  "white-honey": {
    id: "white-honey",
    label: "ホワイトハニー",
    description:
      "ハニープロセスのうち粘液質を1〜2割ほど残す方法。ウォッシュトに近いクリーンさとほのかな甘み",
  },
  "yellow-honey": {
    id: "yellow-honey",
    label: "イエローハニー",
    description:
      "ハニープロセスのうち粘液質を5割ほど残す方法。クリーンさと甘みのバランスがよい",
  },
  sumatra: {
    id: "sumatra",
    label: "スマトラ式",
    description:
      "乾燥途中の生豆を脱穀してさらに乾燥させるインドネシア独特の方法。深いコクとアーシーな風味",
  },
  anaerobic: {
    id: "anaerobic",
    label: "アナエロビックファーメンテーション",
    description:
      "密閉タンク内で酸素を絶って発酵させる新しい方法。ワインのような複雑で個性的な風味",
  },
};

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

// SCA フレーバーホイールの実際の中分類にほぼ準拠した18分類。
// 診断結果は得票のあった分類をすべて返すため、順序は表示順の目安でしかない
export const FLAVOR_CATEGORIES: FlavorCategory[] = [
  // 花 (Floral)
  {
    id: "floral",
    wheelCategory: "花 (Floral)",
    label: "フローラル",
    notes: ["ジャスミン", "カモミール", "ローズ"],
  },
  {
    id: "black-tea",
    wheelCategory: "花 (Floral)",
    label: "紅茶系",
    notes: ["紅茶"],
  },
  // 果実 (Fruity)
  {
    id: "berry",
    wheelCategory: "果実 (Fruity)",
    label: "ベリー系",
    notes: ["ブラックベリー", "ラズベリー", "ブルーベリー", "ストロベリー"],
  },
  {
    id: "dried-fruit",
    wheelCategory: "果実 (Fruity)",
    label: "ドライフルーツ系",
    notes: ["レーズン", "プルーン"],
  },
  {
    id: "other-fruit",
    wheelCategory: "果実 (Fruity)",
    label: "その他フルーツ系",
    notes: ["ぶどう", "桃", "パイナップル"],
  },
  {
    id: "citrus",
    wheelCategory: "果実 (Fruity)",
    label: "シトラス系",
    notes: ["レモン", "ライム", "オレンジ", "グレープフルーツ"],
  },
  // 酸味・発酵 (Sour/Fermented)
  {
    id: "sour",
    wheelCategory: "酸味・発酵 (Sour/Fermented)",
    label: "酸味系",
    notes: ["クエン酸", "リンゴ酸", "酢酸"],
  },
  {
    id: "fermented",
    wheelCategory: "酸味・発酵 (Sour/Fermented)",
    label: "芳醇・ワイニー系",
    notes: [
      "赤ワインのような芳醇さ",
      "ウイスキーのような樽香",
      "熟れすぎた果実の甘い香り",
    ],
  },
  // ロースト (Roasted)
  {
    id: "tobacco",
    wheelCategory: "ロースト (Roasted)",
    label: "たばこ系",
    notes: ["パイプたばこ", "たばこの葉"],
  },
  {
    id: "burnt",
    wheelCategory: "ロースト (Roasted)",
    label: "スモーキー系",
    notes: ["スモーキー", "灰のような香ばしさ", "こげ臭さ"],
  },
  {
    id: "cereal",
    wheelCategory: "ロースト (Roasted)",
    label: "穀物系",
    notes: ["香ばしい穀物", "麦芽のような甘い香ばしさ"],
  },
  // スパイス (Spices)
  {
    id: "pungent",
    wheelCategory: "スパイス (Spices)",
    label: "ペッパー系",
    notes: ["こしょうのようなスパイシーさ", "ピリッとした刺激"],
  },
  {
    id: "brown-spice",
    wheelCategory: "スパイス (Spices)",
    label: "スパイス系",
    notes: ["シナモン", "クローブ", "ナツメグ"],
  },
  // ナッティ・ココア (Nutty/Cocoa)
  {
    id: "nutty",
    wheelCategory: "ナッティ・ココア (Nutty/Cocoa)",
    label: "ナッツ系",
    notes: ["アーモンド", "ヘーゼルナッツ", "ピーナッツ"],
  },
  {
    id: "cocoa",
    wheelCategory: "ナッティ・ココア (Nutty/Cocoa)",
    label: "カカオ系",
    notes: ["ダークチョコレート", "カカオニブ"],
  },
  // 甘味 (Sweet)
  {
    id: "brown-sugar",
    wheelCategory: "甘味 (Sweet)",
    label: "キャラメル・黒糖系",
    notes: ["キャラメル", "はちみつ", "メープルシロップ"],
  },
  {
    id: "vanilla",
    wheelCategory: "甘味 (Sweet)",
    label: "バニラ系",
    notes: ["バニラ", "バニリン"],
  },
  {
    id: "sweet",
    wheelCategory: "甘味 (Sweet)",
    label: "甘い香り系",
    notes: ["ふんわり甘い香り", "全体を包む優しい甘さ"],
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
    roast: 2,
    process: "washed",
    description:
      "紅茶のように軽やかで華やかな一杯が似合うタイプ。浅煎りの個性豊かなシングルオリジンをぜひそのまま楽しんで。",
  },
  "acid-light-fruity-milk": {
    id: "acid-light-fruity-milk",
    name: "フルーティカジュアル型",
    variety: "SL28・SL34",
    origin: "ケニア",
    brewing: "水出しアイスコーヒーで。好みで少量のミルクを",
    roast: 3,
    process: "washed",
    description:
      "果実感のある明るい味わいを気軽に楽しみたいタイプ。ジューシーなケニアの水出しはミルクとの相性も抜群。",
  },
  "acid-light-nutty-straight": {
    id: "acid-light-nutty-straight",
    name: "ハニークリア型",
    variety: "カトゥーラ（ハニープロセス）",
    origin: "コスタリカ",
    brewing: "中煎りをハンドドリップで丁寧に",
    roast: 4,
    process: "white-honey",
    description:
      "すっきりしつつも甘みのある調和が好きなタイプ。ハニープロセスのやさしい甘さが朝の一杯にぴったり。",
  },
  "acid-light-nutty-milk": {
    id: "acid-light-nutty-milk",
    name: "まろやかスイート型",
    variety: "カトゥアイ",
    origin: "ホンジュラス",
    brewing: "中煎りをアイスラテで",
    roast: 4,
    process: "yellow-honey",
    description:
      "軽やかな甘みとミルクのまろやかさを楽しむタイプ。クセのない中米のコーヒーはアレンジしても素材の良さが生きる。",
  },
  "acid-rich-fruity-straight": {
    id: "acid-rich-fruity-straight",
    name: "高貴ゲイシャ型",
    variety: "ゲイシャ",
    origin: "パナマ",
    brewing: "中浅煎りをじっくりハンドドリップで",
    roast: 3,
    process: "anaerobic",
    description:
      "香りの複雑さと余韻を静かに味わいたい探究者タイプ。世界が注目するゲイシャの華やかさと厚みをぜひ体験して。",
  },
  "acid-rich-fruity-milk": {
    id: "acid-rich-fruity-milk",
    name: "果実まろやか型",
    variety: "ブルボン",
    origin: "ルワンダ",
    brewing: "エアロプレスで。カフェオレにしても好相性",
    roast: 4,
    process: "washed",
    description:
      "果実の明るさとコクの両方を求める欲張りタイプ。オレンジのような甘さのルワンダはミルクを入れても輪郭が残る。",
  },
  "acid-rich-nutty-straight": {
    id: "acid-rich-nutty-straight",
    name: "バランス王道型",
    variety: "ブルボン",
    origin: "グアテマラ アンティグア",
    brewing: "中煎りをフレンチプレスで",
    roast: 4,
    process: "washed",
    description:
      "酸味・甘み・コクの調和がとれた王道の一杯が好きなタイプ。チョコのような甘さのアンティグアは外さない選択。",
  },
  "acid-rich-nutty-milk": {
    id: "acid-rich-nutty-milk",
    name: "キャラメルラテ型",
    variety: "カスティージョ",
    origin: "コロンビア",
    brewing: "エスプレッソベースのカフェラテで",
    roast: 6,
    process: "honey",
    description:
      "キャラメルのような甘さとミルクの一体感を楽しむタイプ。ラテにしたときの完成度はコロンビアの得意分野。",
  },
  "bitter-light-fruity-straight": {
    id: "bitter-light-fruity-straight",
    name: "エキゾチックモカ型",
    variety: "モカ・マタリ（ナチュラル精製）",
    origin: "イエメン",
    brewing: "中深煎りをペーパードリップで",
    roast: 5,
    process: "natural",
    description:
      "深みの中に個性的な果実感を求めるロマン派タイプ。独特の芳醇さを持つモカはコーヒーの歴史そのものの味。",
  },
  "bitter-light-fruity-milk": {
    id: "bitter-light-fruity-milk",
    name: "キリマンジャロ爽快型",
    variety: "ブルボン系",
    origin: "タンザニア キリマンジャロ",
    brewing: "急冷アイスコーヒーで。ミルク割りもおすすめ",
    roast: 5,
    process: "washed",
    description:
      "しっかりした飲みごたえと爽やかさを両立したいタイプ。野性味ある果実感のキリマンジャロはアイスで映える。",
  },
  "bitter-light-nutty-straight": {
    id: "bitter-light-nutty-straight",
    name: "毎日ブラジル型",
    variety: "ムンドノーボ",
    origin: "ブラジル",
    brewing: "中煎りをマグカップでたっぷりドリップ",
    roast: 5,
    process: "natural",
    description:
      "気取らず毎日飲める安定の一杯が好きなタイプ。ナッツのような香ばしさのブラジルはデイリーコーヒーの定番。",
  },
  "bitter-light-nutty-milk": {
    id: "bitter-light-nutty-milk",
    name: "アイスオレ型",
    variety: "カトゥアイ",
    origin: "ブラジル サントス",
    brewing: "アイスカフェオレで",
    roast: 6,
    process: "natural",
    description:
      "香ばしさとミルクのやさしさでゴクゴク飲みたいタイプ。ブラジルの甘香ばしさはカフェオレのベースに最適。",
  },
  "bitter-rich-fruity-straight": {
    id: "bitter-rich-fruity-straight",
    name: "個性派マンデリン型",
    variety: "マンデリン（アテン系）",
    origin: "インドネシア スマトラ",
    brewing: "深煎りをフレンチプレスで",
    roast: 7,
    process: "sumatra",
    description:
      "重厚さの中に独特の風味を求める個性派タイプ。アーシーでスパイシーなマンデリンは唯一無二の存在感。",
  },
  "bitter-rich-fruity-milk": {
    id: "bitter-rich-fruity-milk",
    name: "コンデンスリッチ型",
    variety: "ロブスタ",
    origin: "ベトナム",
    brewing: "ベトナム式（練乳入り）で",
    roast: 8,
    process: "natural",
    description:
      "ガツンとした苦味を甘さで包む刺激的な一杯が好きなタイプ。力強いロブスタと練乳の組み合わせはクセになる味。",
  },
  "bitter-rich-nutty-straight": {
    id: "bitter-rich-nutty-straight",
    name: "深煎り職人型",
    variety: "深煎りブレンド（マンデリン×ブラジル）",
    origin: "インドネシア・ブラジル",
    brewing: "ネルドリップまたはエスプレッソで",
    roast: 7,
    process: "sumatra",
    description:
      "ビターな余韻をじっくり味わう喫茶店スタイルが似合うタイプ。丁寧に淹れた深煎りの一杯は何よりの贅沢。",
  },
  "bitter-rich-nutty-milk": {
    id: "bitter-rich-nutty-milk",
    name: "濃厚カプチーノ型",
    variety: "深煎りブレンド（コロンビア×ブラジル）",
    origin: "コロンビア・ブラジル",
    brewing: "カプチーノやカフェラテで",
    roast: 8,
    process: "natural",
    description:
      "深煎りのコクとミルクの濃厚な一体感を楽しむタイプ。エスプレッソの伝統に忠実なイタリアンスタイルがおすすめ。",
  },
};
