import type { Meta, StoryObj } from "@storybook/react-vite";
import { findFlavorCategory, RESULT_TYPES } from "../data/results";
import { ResultCard } from "./ResultCard";

const meta = {
  component: ResultCard,
  title: "Components/ResultCard",
} satisfies Meta<typeof ResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const フルーティ系タイプ: Story = {
  args: {
    type: RESULT_TYPES["acid-light-fruity-straight"],
    flavors: [findFlavorCategory("floral"), findFlavorCategory("berry")],
    diagnosedAt: "2026-07-11T09:00:00.000Z",
  },
};

export const ナッティ系タイプ: Story = {
  args: {
    type: RESULT_TYPES["bitter-rich-nutty-milk"],
    flavors: [findFlavorCategory("roast"), findFlavorCategory("sweet")],
    diagnosedAt: "2026-07-11T09:00:00.000Z",
  },
};

export const フレーバー1件のみ: Story = {
  args: {
    type: RESULT_TYPES["bitter-light-nutty-straight"],
    flavors: [findFlavorCategory("nutty")],
    diagnosedAt: "2026-07-11T09:00:00.000Z",
  },
};
