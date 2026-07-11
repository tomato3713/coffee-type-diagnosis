import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuizScreen } from "./QuizScreen";

const meta = {
  component: QuizScreen,
  title: "Components/QuizScreen",
} satisfies Meta<typeof QuizScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 質問フロー: Story = {
  args: {
    onComplete: () => {},
  },
};
