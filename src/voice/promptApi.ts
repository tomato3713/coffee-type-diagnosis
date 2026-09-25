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

// 評価項目の指示を持たせたベースセッションを作る。初回はここでモデルの
// ダウンロードが走るため、進捗（0〜1）を onDownloadProgress で通知する。
// ダウンロードの開始にはユーザー操作が必要なので、ボタン押下の直後に呼ぶこと。
// async にしているのは、非対応環境で LanguageModel が未定義のときの
// ReferenceError を同期例外ではなく reject として呼び出し側に返すため
export async function createTastingSession(
  criteria: CuppingCriterionDef[],
  onDownloadProgress?: (loaded: number) => void,
): Promise<LanguageModel> {
  return LanguageModel.create({
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
}

// 感想の文字起こしを端末内のモデルで構造化する
export async function summarizeTasting(
  base: LanguageModel,
  criteria: CuppingCriterionDef[],
  transcript: string,
): Promise<CuppingCriterionAnswer[]> {
  // ベースを直接使わず毎回 clone する。前回の感想が文脈に残ると、
  // 言い直して再実行したときに古い内容が記録に混ざってしまうため
  const session = await base.clone();
  try {
    const raw = await session.prompt(transcript, {
      responseConstraint: buildTastingSchema(criteria),
    });
    return parseTastingResponse(raw, criteria);
  } finally {
    session.destroy();
  }
}
