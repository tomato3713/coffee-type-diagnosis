import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlavorTreeScreen } from "./FlavorTreeScreen";

const meta = {
  component: FlavorTreeScreen,
  title: "Components/FlavorTreeScreen",
} satisfies Meta<typeof FlavorTreeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 全体表示: Story = {
  args: {
    highlightIds: [],
    onBack: () => {},
    backLabel: "トップへ",
  },
};

export const 診断結果の強調表示: Story = {
  args: {
    highlightIds: ["floral", "berry"],
    onBack: () => {},
    backLabel: "診断結果に戻る",
  },
};
