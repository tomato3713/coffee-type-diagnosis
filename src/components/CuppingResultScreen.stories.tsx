import type { Meta, StoryObj } from "@storybook/react-vite";
import { CUPPING_CRITERIA, criteriaForMode } from "../data/cupping";
import { CuppingResultScreen } from "./CuppingResultScreen";

const meta = {
  component: CuppingResultScreen,
  title: "Components/CuppingResultScreen",
} satisfies Meta<typeof CuppingResultScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const カッピング結果: Story = {
  args: {
    entry: {
      id: "entry-1",
      cuppedAt: "2026-07-11T09:00:00.000Z",
      coffeeName: "コロンビア ウイラ",
      mode: "detailed",
      answers: CUPPING_CRITERIA.map((c) => ({
        criterionId: c.id,
        score: 7,
        tags: [],
        note: "",
      })),
    },
    onRestart: () => {},
    onBackToTop: () => {},
    onEditCriterion: () => {},
    onUpdateCoffeeName: () => {},
    onEditCoffeeInfo: () => {},
    onUpgradeToDetailed: () => {},
  },
};

// 詳細記録に切り替えるボタンが表示される
export const 簡易モードのカッピング結果: Story = {
  args: {
    entry: {
      id: "entry-2",
      cuppedAt: "2026-07-11T09:00:00.000Z",
      coffeeName: "コロンビア ウイラ",
      mode: "simple",
      answers: criteriaForMode("simple").map((c) => ({
        criterionId: c.id,
        score: 7,
        tags: [],
        note: "",
      })),
    },
    onRestart: () => {},
    onBackToTop: () => {},
    onEditCriterion: () => {},
    onUpdateCoffeeName: () => {},
    onEditCoffeeInfo: () => {},
    onUpgradeToDetailed: () => {},
  },
};
