import type { Meta, StoryObj } from "@storybook/react-vite";
import { SharedResultScreen } from "./SharedResultScreen";

const meta = {
  component: SharedResultScreen,
  title: "Components/SharedResultScreen",
} satisfies Meta<typeof SharedResultScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const シェアされた結果の閲覧: Story = {
  args: {
    result: {
      typeId: "acid-light-fruity-straight",
      flavorIds: ["floral", "berry"],
    },
    onStart: () => {},
    onShowTree: () => {},
  },
};
