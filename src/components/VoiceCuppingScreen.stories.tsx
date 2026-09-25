import type { Meta, StoryObj } from "@storybook/react-vite";
import { criteriaForMode } from "../data/cupping";
import { VoiceCuppingScreen } from "./VoiceCuppingScreen";

const meta = {
  component: VoiceCuppingScreen,
  title: "Components/VoiceCuppingScreen",
  args: {
    criteria: criteriaForMode("simple"),
    onSummarized: () => {},
    onUseForm: () => {},
    onBack: () => {},
  },
} satisfies Meta<typeof VoiceCuppingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 話す前: Story = {};

export const 文字起こし済み: Story = {
  args: {
    initialTranscript:
      "甘さはキャラメルみたいで強め。酸味はレモンっぽくて明るい。全体的にすごく好み。",
  },
};
