import type { FlavorCategoryId } from "../types";

// SCA フレーバーホイール（2016年版）を木構造で表したグラフデータ。
// 日本語訳は https://blog.outdoor-coffee.com/ 掲載の翻訳を参考にしている。
// color はカテゴリの枝の色（子孫に継承）、categoryIds は診断結果の
// フレーバー分類（FLAVOR_CATEGORIES）との対応で、強調表示に使う
export interface FlavorTreeNode {
  label: string;
  icon?: string;
  color?: string;
  categoryIds?: FlavorCategoryId[];
  children?: FlavorTreeNode[];
}

export const FLAVOR_TREE: FlavorTreeNode = {
  label: "コーヒーフレーバー",
  icon: "☕",
  color: "#6f4e37",
  children: [
    {
      label: "花 (Floral)",
      icon: "🌸",
      color: "#d9538c",
      children: [
        { label: "紅茶" },
        {
          label: "花",
          categoryIds: ["floral"],
          children: [
            { label: "カモミール", icon: "🌼" },
            { label: "ローズ", icon: "🌹" },
            { label: "ジャスミン" },
          ],
        },
      ],
    },
    {
      label: "果実 (Fruity)",
      icon: "🍓",
      color: "#d43852",
      children: [
        {
          label: "ベリー",
          categoryIds: ["berry"],
          children: [
            { label: "ブラックベリー" },
            { label: "ラズベリー" },
            { label: "ブルーベリー", icon: "🫐" },
            { label: "ストロベリー", icon: "🍓" },
          ],
        },
        {
          label: "ドライフルーツ",
          categoryIds: ["dried-fermented"],
          children: [{ label: "レーズン" }, { label: "プルーン" }],
        },
        {
          label: "その他の果実",
          categoryIds: ["tropical"],
          children: [
            { label: "ココナッツ", icon: "🥥" },
            { label: "さくらんぼ", icon: "🍒" },
            { label: "ざくろ" },
            { label: "パイナップル", icon: "🍍" },
            { label: "ぶどう", icon: "🍇" },
            { label: "りんご", icon: "🍎" },
            { label: "桃", icon: "🍑" },
            { label: "洋なし", icon: "🍐" },
          ],
        },
        {
          label: "柑橘系",
          categoryIds: ["citrus"],
          children: [
            { label: "グレープフルーツ" },
            { label: "オレンジ", icon: "🍊" },
            { label: "レモン", icon: "🍋" },
            { label: "ライム" },
          ],
        },
      ],
    },
    {
      label: "酸味・発酵 (Sour/Fermented)",
      icon: "🍷",
      color: "#deb52c",
      children: [
        {
          label: "酸味",
          children: [
            { label: "酸っぱい香り" },
            { label: "酢酸" },
            { label: "酪酸" },
            { label: "イソ吉草酸" },
            { label: "クエン酸" },
            { label: "リンゴ酸" },
          ],
        },
        {
          label: "アルコール・発酵",
          categoryIds: ["dried-fermented"],
          children: [
            { label: "ワイン", icon: "🍷" },
            { label: "ウイスキー", icon: "🥃" },
            { label: "発酵した香り" },
            { label: "熟れすぎの果実" },
          ],
        },
      ],
    },
    {
      label: "緑・植物 (Green/Vegetative)",
      icon: "🌿",
      color: "#3a9a55",
      children: [
        { label: "オリーブオイル", icon: "🫒" },
        { label: "生木のような" },
        {
          label: "緑・植物",
          children: [
            { label: "未熟" },
            { label: "豆のような" },
            { label: "摘みたて" },
            { label: "濃い緑" },
            { label: "植物のような" },
            { label: "干し草のような" },
            { label: "ハーブのような", icon: "🌿" },
          ],
        },
      ],
    },
    {
      label: "その他 (Other)",
      icon: "🧪",
      color: "#5a94a8",
      children: [
        {
          label: "紙・カビ",
          children: [
            { label: "古びた" },
            { label: "段ボール", icon: "📦" },
            { label: "紙のような" },
            { label: "木のような" },
            { label: "カビ・湿気" },
            { label: "土のような" },
            { label: "動物のような" },
            { label: "肉・スープのような" },
            { label: "フェノール" },
          ],
        },
        {
          label: "化学物質",
          children: [
            { label: "苦い" },
            { label: "塩辛い" },
            { label: "薬品のような" },
            { label: "石油" },
            { label: "スカンク" },
            { label: "ゴム" },
          ],
        },
      ],
    },
    {
      label: "ロースト (Roasted)",
      icon: "🔥",
      color: "#8a4a2b",
      children: [
        { label: "パイプたばこ" },
        { label: "たばこ" },
        {
          label: "焦げた",
          categoryIds: ["roast"],
          children: [
            { label: "刺すような" },
            { label: "灰のような" },
            { label: "煙たい", icon: "💨" },
            { label: "こげ臭い" },
          ],
        },
        {
          label: "穀物",
          categoryIds: ["roast"],
          children: [{ label: "穀物のような", icon: "🌾" }, { label: "麦芽" }],
        },
      ],
    },
    {
      label: "スパイス (Spices)",
      icon: "🌶️",
      color: "#b0413e",
      children: [
        { label: "刺激的" },
        { label: "こしょう" },
        {
          label: "茶色いスパイス",
          categoryIds: ["spice"],
          children: [
            { label: "アニス" },
            { label: "ナツメグ" },
            { label: "シナモン" },
            { label: "クローブ" },
          ],
        },
      ],
    },
    {
      label: "ナッツ・ココア (Nutty/Cocoa)",
      icon: "🥜",
      color: "#9a6b4f",
      children: [
        {
          label: "ナッツ",
          categoryIds: ["nutty"],
          children: [
            { label: "ピーナッツ", icon: "🥜" },
            { label: "ヘーゼルナッツ" },
            { label: "アーモンド" },
          ],
        },
        {
          label: "ココア",
          categoryIds: ["cocoa"],
          children: [
            { label: "チョコレート", icon: "🍫" },
            { label: "ダークチョコレート" },
          ],
        },
      ],
    },
    {
      label: "甘味 (Sweet)",
      icon: "🍯",
      color: "#e0762c",
      categoryIds: ["sweet"],
      children: [
        {
          label: "黒糖",
          children: [
            { label: "糖蜜" },
            { label: "メープルシロップ", icon: "🍁" },
            { label: "キャラメル", icon: "🍮" },
            { label: "はちみつ", icon: "🍯" },
          ],
        },
        { label: "バニラ" },
        { label: "バニリン" },
        { label: "甘い香り" },
        { label: "全体的な甘さ" },
      ],
    },
  ],
};
