import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResultScreen } from "./ResultScreen";

const meta = {
  component: ResultScreen,
  title: "Components/ResultScreen",
} satisfies Meta<typeof ResultScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 診断結果: Story = {
  args: {
    entry: {
      id: "entry-1",
      diagnosedAt: "2026-07-11T09:00:00.000Z",
      typeId: "acid-rich-fruity-milk",
      flavorIds: ["fermented", "berry"],
      baseAnswers: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      flavorAnswers: [0, 1, 0],
    },
    onRestart: () => {},
    onBackToTop: () => {},
    onShowTree: () => {},
  },
};
