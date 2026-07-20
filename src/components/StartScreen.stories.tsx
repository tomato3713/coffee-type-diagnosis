import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CuppingHistoryEntry, HistoryEntry } from "../types";
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
    roast: 2,
    process: "washed",
    flavorIds: ["floral", "berry"],
    baseAnswers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    flavorAnswers: [0, 0, 0],
    roastAnswers: [0, 0, 0],
    processAnswers: [0, 0, 0],
  },
  {
    id: "entry-2",
    diagnosedAt: "2026-07-01T09:00:00.000Z",
    typeId: "bitter-rich-nutty-milk",
    roast: 8,
    process: "natural",
    flavorIds: ["burnt", "sweet"],
    baseAnswers: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    flavorAnswers: [1, 1, 1],
    roastAnswers: [1, 1, 1],
    processAnswers: [1, 1, 0],
  },
];

const cuppingHistoryEntries: CuppingHistoryEntry[] = [
  {
    id: "cupping-1",
    cuppedAt: "2026-07-11T09:00:00.000Z",
    coffeeName: "エチオピア イルガチェフェ",
    answers: [],
  },
];

export const 初回訪問: Story = {
  args: {
    history: [],
    onStart: () => {},
    onSelect: () => {},
    onShowTree: () => {},
    cuppingHistory: [],
    onStartCupping: () => {},
    onSelectCupping: () => {},
  },
};

export const 履歴あり: Story = {
  args: {
    ...初回訪問.args,
    history: historyEntries,
    cuppingHistory: cuppingHistoryEntries,
  },
};
