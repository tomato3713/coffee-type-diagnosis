import type { CuppingCriterionDef } from "../data/cupping";
import {
  buildTastingSchema,
  buildTastingSystemPrompt,
  parseTastingResponse,
} from "../logic/voiceCupping";
import type { CuppingCriterionAnswer } from "../types";

// 入出力とも日本語であることを宣言しておく。宣言しないと、日本語に対応
// していないモデル構成でも available と判定されてしまうため
const LANGUAGE_OPTIONS = {
  expectedInputs: [{ type: "text", languages: ["ja"] }],
  expectedOutputs: [{ type: "text", languages: ["ja"] }],
} satisfies LanguageModelCreateCoreOptions;

// Prompt API（Chrome 内蔵の Gemini Nano）が使えるかを返す。
// 非対応ブラウザでは LanguageModel 自体が未定義なので先に存在確認する
export async function checkTastingModelAvailability(): Promise<Availability> {
  if (!("LanguageModel" in globalThis)) return "unavailable";
  try {
    return await LanguageModel.availability(LANGUAGE_OPTIONS);
  } catch {
    return "unavailable";
  }
}

// 感想の文字起こしを端末内のモデルで構造化する。初回はモデルの
// ダウンロードが走るため、進捗（0〜1）を onDownloadProgress で通知する
export async function summarizeTasting(
  criteria: CuppingCriterionDef[],
  transcript: string,
  onDownloadProgress?: (loaded: number) => void,
): Promise<CuppingCriterionAnswer[]> {
  const session = await LanguageModel.create({
    ...LANGUAGE_OPTIONS,
    initialPrompts: [
      { role: "system", content: buildTastingSystemPrompt(criteria) },
    ],
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        onDownloadProgress?.(e.loaded);
      });
    },
  });
  try {
    const raw = await session.prompt(transcript, {
      responseConstraint: buildTastingSchema(criteria),
    });
    return parseTastingResponse(raw, criteria);
  } finally {
    // セッションは1回の要約ごとに作り捨てる。前の感想が文脈に残ると
    // 別のコーヒーの記録に混ざってしまうため
    session.destroy();
  }
}
