import type { Meta, StoryObj } from "@storybook/react-vite";
import { CUPPING_CRITERIA, criteriaForMode } from "../data/cupping";
import { CuppingScreen } from "./CuppingScreen";

const meta = {
  component: CuppingScreen,
  title: "Components/CuppingScreen",
} satisfies Meta<typeof CuppingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 評価フロー: Story = {
  args: {
    criteria: CUPPING_CRITERIA,
    onComplete: () => {},
  },
};

export const 簡易モードの評価フロー: Story = {
  args: {
    criteria: criteriaForMode("simple"),
    onComplete: () => {},
  },
};

export const アップグレード継続フロー: Story = {
  args: {
    criteria: CUPPING_CRITERIA,
    initialAnswers: criteriaForMode("simple").map((c) => ({
      criterionId: c.id,
      score: 7,
      tags: [],
      note: "",
    })),
    initialCursor: CUPPING_CRITERIA.findIndex((c) => c.id === "clean-cup"),
    onComplete: () => {},
  },
};
