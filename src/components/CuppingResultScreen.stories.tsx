import type { Meta, StoryObj } from "@storybook/react-vite";
import { CUPPING_CRITERIA } from "../data/cupping";
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
  },
};
