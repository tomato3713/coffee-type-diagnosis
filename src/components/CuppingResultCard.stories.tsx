import type { Meta, StoryObj } from "@storybook/react-vite";
import { CUPPING_CRITERIA } from "../data/cupping";
import type { CuppingCriterionAnswer } from "../types";
import { CuppingResultCard } from "./CuppingResultCard";

const meta = {
  component: CuppingResultCard,
  title: "Components/CuppingResultCard",
} satisfies Meta<typeof CuppingResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

function answers(
  overrides: Partial<Record<number, Partial<CuppingCriterionAnswer>>> = {},
): CuppingCriterionAnswer[] {
  return CUPPING_CRITERIA.map((c, i) => ({
    criterionId: c.id,
    score: 7,
    tags: [],
    note: "",
    ...overrides[i],
  }));
}

export const 高得点の一貫した評価: Story = {
  args: {
    entry: {
      id: "entry-1",
      cuppedAt: "2026-07-11T09:00:00.000Z",
      coffeeName: "パナマ ゲイシャ",
      answers: answers({
        0: { score: 9, tags: ["雑味なし"] },
        4: {
          score: 9,
          tags: ["フローラル", "ベリー系"],
          note: "華やかで複雑な香り",
        },
        5: { score: 9, tags: ["フローラル"] },
        7: { score: 10, tags: ["また飲みたい"] },
      }),
    },
  },
};

export const タグやメモが少ない評価: Story = {
  args: {
    entry: {
      id: "entry-2",
      cuppedAt: "2026-07-11T09:00:00.000Z",
      coffeeName: "ブラジル サントス",
      answers: answers({ 4: { score: 5 }, 5: { score: 5 } }),
    },
  },
};

export const 項目をクリックして編集できる状態: Story = {
  args: {
    entry: {
      id: "entry-4",
      cuppedAt: "2026-07-11T09:00:00.000Z",
      coffeeName: "ケニア ニエリ",
      answers: answers({
        0: { score: 9, tags: ["雑味なし"] },
        4: { score: 8, tags: ["ベリー系"] },
      }),
    },
    onSelectCriterion: () => {},
  },
};

export const 長文メモを含む評価: Story = {
  args: {
    entry: {
      id: "entry-3",
      cuppedAt: "2026-07-11T09:00:00.000Z",
      coffeeName: "",
      answers: answers({
        4: {
          score: 8,
          tags: ["カカオ系", "ナッツ系"],
          note: "最初はカカオのような苦味を感じたが、温度が下がるにつれてナッツのような香ばしさが強くなり、余韻にはほのかな甘さも残った。飲み進めるほど印象が変化する複雑な一杯だった。",
        },
      }),
    },
  },
};
