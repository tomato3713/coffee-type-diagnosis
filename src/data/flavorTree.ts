import type { FlavorCategoryId } from "../types";

// SCA フレーバーホイール（2016年版）を木構造で表したグラフデータ。
// 日本語訳は https://blog.outdoor-coffee.com/ 掲載の翻訳を参考にしている。
// color はカテゴリの枝の色（子孫に継承）、categoryIds は診断結果の
// フレーバー分類（FLAVOR_CATEGORIES）との対応で、強調表示に使う。
// description はノード長押し時の詳細説明に使う
export interface FlavorTreeNode {
  label: string;
  icon?: string;
  color?: string;
  categoryIds?: FlavorCategoryId[];
  description?: string;
  children?: FlavorTreeNode[];
}

export const FLAVOR_TREE: FlavorTreeNode = {
  label: "コーヒーフレーバー",
  icon: "☕",
  color: "#6f4e37",
  description:
    "コーヒーに現れる香味を体系立てた SCA フレーバーホイールの出発点です。",
  children: [
    {
      label: "花 (Floral)",
      icon: "🌸",
      color: "#d9538c",
      description:
        "花のような繊細で華やかな香り。浅煎りのコーヒーで感じやすい系統です。",
      children: [
        {
          label: "紅茶",
          description: "紅茶を思わせる、上品でやや渋みを伴う香り。",
        },
        {
          label: "花",
          categoryIds: ["floral"],
          description: "花全般に共通する、甘く優雅な香りのグループです。",
          children: [
            {
              label: "カモミール",
              icon: "🌼",
              description:
                "カモミールティーのような、やさしく穏やかな花の香り。",
            },
            {
              label: "ローズ",
              icon: "🌹",
              description: "バラの花びらのような、上品で華やかな香り。",
            },
            {
              label: "ジャスミン",
              description: "ジャスミン茶のような、甘く広がりのある花の香り。",
            },
          ],
        },
      ],
    },
    {
      label: "果実 (Fruity)",
      icon: "🍓",
      color: "#d43852",
      description:
        "果物のような甘酸っぱさや芳香を表す系統。産地の個性が特に出やすいです。",
      children: [
        {
          label: "ベリー",
          categoryIds: ["berry"],
          description:
            "ベリー類に共通する、甘酸っぱくジューシーな香味のグループです。",
          children: [
            {
              label: "ブラックベリー",
              description:
                "ブラックベリーのような、濃厚で少し土っぽい甘酸っぱさ。",
            },
            {
              label: "ラズベリー",
              description: "ラズベリーのような、鮮やかで華やかな酸味と甘み。",
            },
            {
              label: "ブルーベリー",
              icon: "🫐",
              description: "ブルーベリーのような、瑞々しく上品な甘酸っぱさ。",
            },
            {
              label: "ストロベリー",
              icon: "🍓",
              description:
                "いちごのような、みずみずしく親しみやすい甘酸っぱさ。",
            },
          ],
        },
        {
          label: "ドライフルーツ",
          categoryIds: ["dried-fermented"],
          description:
            "乾燥や熟成で凝縮した果実の、濃厚で芳醇な香味のグループです。",
          children: [
            {
              label: "レーズン",
              description: "レーズンのような、凝縮した甘さと芳醇な香り。",
            },
            {
              label: "プルーン",
              description: "プルーンのような、濃厚でしっとりした甘み。",
            },
          ],
        },
        {
          label: "その他の果実",
          categoryIds: ["tropical"],
          description:
            "上記に分類されない果実全般の香味をまとめたグループです。",
          children: [
            {
              label: "ココナッツ",
              icon: "🥥",
              description: "ココナッツのような、まろやかで南国らしい甘い香り。",
            },
            {
              label: "さくらんぼ",
              icon: "🍒",
              description: "さくらんぼのような、可憐で軽やかな甘酸っぱさ。",
            },
            {
              label: "ざくろ",
              description: "ざくろのような、華やかで少し渋みのある酸味。",
            },
            {
              label: "パイナップル",
              icon: "🍍",
              description:
                "パイナップルのような、トロピカルで弾けるような酸味と甘さ。",
            },
            {
              label: "ぶどう",
              icon: "🍇",
              description: "ぶどうのような、瑞々しくジューシーな甘み。",
            },
            {
              label: "りんご",
              icon: "🍎",
              description: "青りんごのような、すっきりとした爽やかな酸味。",
            },
            {
              label: "桃",
              icon: "🍑",
              description: "桃のような、上品でジューシーな甘さと香り。",
            },
            {
              label: "洋なし",
              icon: "🍐",
              description: "洋なしのような、やわらかく上品な甘さ。",
            },
          ],
        },
        {
          label: "柑橘系",
          categoryIds: ["citrus"],
          description:
            "柑橘類に共通する、はじけるような明るい酸味のグループです。",
          children: [
            {
              label: "グレープフルーツ",
              description:
                "グレープフルーツのような、ほろ苦さを伴う爽やかな酸味。",
            },
            {
              label: "オレンジ",
              icon: "🍊",
              description: "オレンジのような、甘さを伴う明るい酸味。",
            },
            {
              label: "レモン",
              icon: "🍋",
              description: "レモンのような、シャープで鮮烈な酸味。",
            },
            {
              label: "ライム",
              description: "ライムのような、きりっとした青々しい酸味。",
            },
          ],
        },
      ],
    },
    {
      label: "酸味・発酵 (Sour/Fermented)",
      icon: "🍷",
      color: "#deb52c",
      description:
        "酸味や発酵由来の香味を表す系統。爽やかさから熟成香まで幅広く含みます。",
      children: [
        {
          label: "酸味",
          description:
            "コーヒーに含まれる有機酸由来の、様々な質の酸味をまとめたグループです。",
          children: [
            {
              label: "酸っぱい香り",
              description: "単純にすっぱいと感じる、直接的な酸の香り。",
            },
            {
              label: "酢酸",
              description: "お酢のような、ツンとした鋭い酸味。",
            },
            {
              label: "酪酸",
              description: "チーズのような、やや動物的でコクのある酸味。",
            },
            {
              label: "イソ吉草酸",
              description: "チーズや靴下を思わせる、独特で強い酸の香り。",
            },
            {
              label: "クエン酸",
              description: "柑橘類に含まれる、爽やかでシャープな酸味。",
            },
            {
              label: "リンゴ酸",
              description: "青りんごのような、すっきりとした軽い酸味。",
            },
          ],
        },
        {
          label: "アルコール・発酵",
          categoryIds: ["dried-fermented"],
          description:
            "発酵やアルコールを思わせる、芳醇で複雑な香味のグループです。",
          children: [
            {
              label: "ワイン",
              icon: "🍷",
              description: "赤ワインのような、芳醇でコクのある発酵香。",
            },
            {
              label: "ウイスキー",
              icon: "🥃",
              description: "ウイスキーのような、樽由来の深みある香り。",
            },
            {
              label: "発酵した香り",
              description: "発酵食品を思わせる、酸味と旨みを伴う複雑な香り。",
            },
            {
              label: "熟れすぎの果実",
              description:
                "熟しすぎた果実のような、甘さと発酵感が混じった香り。",
            },
          ],
        },
      ],
    },
    {
      label: "緑・植物 (Green/Vegetative)",
      icon: "🌿",
      color: "#3a9a55",
      description: "青々しい植物や未熟な豆を思わせる香味の系統です。",
      children: [
        {
          label: "オリーブオイル",
          icon: "🫒",
          description: "オリーブオイルのような、青々しくコクのある香り。",
        },
        {
          label: "生木のような",
          description: "切ったばかりの木材を思わせる、青くさい香り。",
        },
        {
          label: "緑・植物",
          description:
            "未熟な豆や青葉を思わせる、生々しい植物由来の香味のグループです。",
          children: [
            {
              label: "未熟",
              description: "未成熟な豆特有の、青くさく渋みのある香り。",
            },
            {
              label: "豆のような",
              description: "生の豆そのものを思わせる、青くさい香り。",
            },
            {
              label: "摘みたて",
              description: "摘みたての葉のような、瑞々しく青い香り。",
            },
            {
              label: "濃い緑",
              description: "濃い緑の葉を思わせる、深みのある青くさい香り。",
            },
            {
              label: "植物のような",
              description: "植物全般に共通する、青々しくナチュラルな香り。",
            },
            {
              label: "干し草のような",
              description: "乾いた干し草を思わせる、素朴で穏やかな香り。",
            },
            {
              label: "ハーブのような",
              icon: "🌿",
              description: "ハーブを思わせる、清涼感のある爽やかな香り。",
            },
          ],
        },
      ],
    },
    {
      label: "その他 (Other)",
      icon: "🧪",
      color: "#5a94a8",
      description:
        "紙・カビ・化学物質など、コーヒー本来の心地よさとは異なる香味の系統です。",
      children: [
        {
          label: "紙・カビ",
          description:
            "保管や乾燥に由来する、紙やカビを思わせる香味のグループです。",
          children: [
            {
              label: "古びた",
              description: "時間が経って古びたような、こもった香り。",
            },
            {
              label: "段ボール",
              icon: "📦",
              description: "段ボールのような、乾いて紙っぽい香り。",
            },
            {
              label: "紙のような",
              description: "紙そのものを思わせる、無機質な香り。",
            },
            {
              label: "木のような",
              description: "木材を思わせる、乾いた素朴な香り。",
            },
            {
              label: "カビ・湿気",
              description: "湿気やカビを思わせる、こもった不快な香り。",
            },
            {
              label: "土のような",
              description: "土を思わせる、アーシーで重い香り。",
            },
            {
              label: "動物のような",
              description: "動物的でやや獣くさい、独特の香り。",
            },
            {
              label: "肉・スープのような",
              description: "肉や出汁を思わせる、うまみを伴う香り。",
            },
            {
              label: "フェノール",
              description: "薬品的で刺激のある、フェノール由来の香り。",
            },
          ],
        },
        {
          label: "化学物質",
          description:
            "薬品や工業製品を思わせる、コーヒー本来の香味とは異質なグループです。",
          children: [
            {
              label: "苦い",
              description: "強く突き刺さるような、単純な苦味。",
            },
            {
              label: "塩辛い",
              description: "塩気を感じさせる、しょっぱい味わい。",
            },
            {
              label: "薬品のような",
              description: "医薬品を思わせる、ツンとした香り。",
            },
            {
              label: "石油",
              description: "石油製品のような、刺激的で無機質な香り。",
            },
            {
              label: "スカンク",
              description: "スカンクのような、強烈で不快な香り。",
            },
            {
              label: "ゴム",
              description: "ゴムを焼いたような、独特で刺激的な香り。",
            },
          ],
        },
      ],
    },
    {
      label: "ロースト (Roasted)",
      icon: "🔥",
      color: "#8a4a2b",
      description: "焙煎によって生まれる香ばしさや焦げ感を表す系統です。",
      children: [
        {
          label: "パイプたばこ",
          description: "パイプたばこのような、甘く香ばしい煙の香り。",
        },
        {
          label: "たばこ",
          description: "たばこの葉のような、渋みのある香ばしさ。",
        },
        {
          label: "焦げた",
          categoryIds: ["roast"],
          description: "焙煎の焦げに由来する、香ばしく強い香味のグループです。",
          children: [
            {
              label: "刺すような",
              description: "鼻を突くような、鋭く刺激的な焦げの香り。",
            },
            {
              label: "灰のような",
              description: "灰を思わせる、乾いてくすんだ香り。",
            },
            {
              label: "煙たい",
              icon: "💨",
              description: "煙のような、燻したスモーキーな香り。",
            },
            {
              label: "こげ臭い",
              description: "焦げ付いたような、強い香ばしさ。",
            },
          ],
        },
        {
          label: "穀物",
          categoryIds: ["roast"],
          description: "麦や穀物を思わせる、香ばしく素朴な香味のグループです。",
          children: [
            {
              label: "穀物のような",
              icon: "🌾",
              description: "焼いた穀物のような、香ばしく優しい香り。",
            },
            { label: "麦芽", description: "麦芽のような、甘く香ばしい香り。" },
          ],
        },
      ],
    },
    {
      label: "スパイス (Spices)",
      icon: "🌶️",
      color: "#b0413e",
      description: "シナモンやクローブなど、香辛料を思わせる香味の系統です。",
      children: [
        {
          label: "刺激的",
          description: "スパイス特有の、ピリッとした刺激のある香り。",
        },
        {
          label: "こしょう",
          description: "こしょうのような、ピリッと鋭い香り。",
        },
        {
          label: "茶色いスパイス",
          categoryIds: ["spice"],
          description: "シナモンなど温かみのあるスパイスの香味のグループです。",
          children: [
            {
              label: "アニス",
              description: "アニスのような、甘く独特な香草の香り。",
            },
            {
              label: "ナツメグ",
              description: "ナツメグのような、温かみのある甘い香り。",
            },
            {
              label: "シナモン",
              description: "シナモンのような、甘く温かみのある香り。",
            },
            {
              label: "クローブ",
              description: "クローブのような、刺激的で甘い香り。",
            },
          ],
        },
      ],
    },
    {
      label: "ナッツ・ココア (Nutty/Cocoa)",
      icon: "🥜",
      color: "#9a6b4f",
      description: "ナッツやチョコレートのような香ばしい甘みを表す系統です。",
      children: [
        {
          label: "ナッツ",
          categoryIds: ["nutty"],
          description:
            "ナッツ全般に共通する、香ばしくコクのある香味のグループです。",
          children: [
            {
              label: "ピーナッツ",
              icon: "🥜",
              description: "ピーナッツのような、香ばしく親しみやすい香り。",
            },
            {
              label: "ヘーゼルナッツ",
              description: "ヘーゼルナッツのような、上品でコクのある香ばしさ。",
            },
            {
              label: "アーモンド",
              description: "アーモンドのような、香ばしくほのかに甘い香り。",
            },
          ],
        },
        {
          label: "ココア",
          categoryIds: ["cocoa"],
          description: "カカオ由来の、ほろ苦く芳醇な香味のグループです。",
          children: [
            {
              label: "チョコレート",
              icon: "🍫",
              description: "ミルクチョコレートのような、甘くまろやかな香り。",
            },
            {
              label: "ダークチョコレート",
              description: "ビターチョコレートのような、ほろ苦く濃厚な香り。",
            },
          ],
        },
      ],
    },
    {
      label: "甘味 (Sweet)",
      icon: "🍯",
      color: "#e0762c",
      categoryIds: ["sweet"],
      description:
        "キャラメルやはちみつのような、コーヒー由来の甘さを表す系統です。",
      children: [
        {
          label: "黒糖",
          description:
            "黒糖やキャラメルのような、コクのある甘さのグループです。",
          children: [
            {
              label: "糖蜜",
              description: "糖蜜のような、濃厚でコクのある甘さ。",
            },
            {
              label: "メープルシロップ",
              icon: "🍁",
              description:
                "メープルシロップのような、まろやかで奥行きのある甘さ。",
            },
            {
              label: "キャラメル",
              icon: "🍮",
              description: "キャラメルのような、香ばしくコクのある甘さ。",
            },
            {
              label: "はちみつ",
              icon: "🍯",
              description: "はちみつのような、まろやかで上品な甘さ。",
            },
          ],
        },
        { label: "バニラ", description: "バニラのような、甘く優しい香り。" },
        {
          label: "バニリン",
          description: "バニラの主成分バニリン由来の、甘く芳香的な香り。",
        },
        {
          label: "甘い香り",
          description: "特定の甘みに限らない、全体的に甘さを感じる香り。",
        },
        {
          label: "全体的な甘さ",
          description: "コーヒー全体を通して感じる、まろやかな甘さ。",
        },
      ],
    },
  ],
};
