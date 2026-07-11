import type { Meta, StoryObj } from "@storybook/react-vite";
import type { HistoryEntry } from "../types";
import { StartScreen } from "./StartScreen";

const meta = {
  component: StartScreen,
  title: "Components/StartScreen",
} satisfies Meta<typeof StartScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const historyEntries: HistoryEntry[] = [
  {
    id: "entry-1",
    diagnosedAt: "2026-07-11T09:00:00.000Z",
    typeId: "acid-light-fruity-straight",
    flavorIds: ["floral", "berry"],
    baseAnswers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    flavorAnswers: [0, 0, 0],
  },
  {
    id: "entry-2",
    diagnosedAt: "2026-07-01T09:00:00.000Z",
    typeId: "bitter-rich-nutty-milk",
    flavorIds: ["roast", "sweet"],
    baseAnswers: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    flavorAnswers: [1, 1, 1],
  },
];

export const 初回訪問: Story = {
  args: {
    history: [],
    onStart: () => {},
    onSelect: () => {},
  },
};

export const 履歴あり: Story = {
  args: {
    ...初回訪問.args,
    history: historyEntries,
  },
};
