import type { Meta, StoryObj } from "@storybook/react-vite";
import { CuppingScreen } from "./CuppingScreen";

const meta = {
  component: CuppingScreen,
  title: "Components/CuppingScreen",
} satisfies Meta<typeof CuppingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 評価フロー: Story = {
  args: {
    onComplete: () => {},
  },
};
