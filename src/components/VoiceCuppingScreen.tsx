import { useState } from "react";
import type { CuppingCriterionDef } from "../data/cupping";
import type { CuppingCriterionAnswer } from "../types";
import { summarizeTasting } from "../voice/promptApi";
import {
  isSpeechRecognitionSupported,
  useSpeechRecognition,
} from "../voice/speechRecognition";

interface Props {
  criteria: CuppingCriterionDef[];
  // 言及された項目だけの部分回答を渡す。未回答の項目はフォームで埋めてもらう
  onSummarized: (answers: CuppingCriterionAnswer[]) => void;
  onUseForm: () => void;
  onBack: () => void;
  // Storybook で文字起こし済みの状態を再現するために使う
  initialTranscript?: string;
}

type Status =
  | { kind: "idle" }
  | { kind: "summarizing"; downloaded?: number }
  | { kind: "error"; message: string };

export function VoiceCuppingScreen({
  criteria,
  onSummarized,
  onUseForm,
  onBack,
  initialTranscript,
}: Props) {
  const [transcript, setTranscript] = useState(initialTranscript ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const speech = useSpeechRecognition((text) =>
    setTranscript((prev) => (prev ? `${prev}\n${text}` : text)),
  );
  const speechSupported = isSpeechRecognitionSupported();
  const busy = status.kind === "summarizing";

  async function summarize() {
    speech.stop();
    setStatus({ kind: "summarizing" });
    try {
      const answers = await summarizeTasting(criteria, transcript, (loaded) =>
        setStatus({ kind: "summarizing", downloaded: loaded }),
      );
      if (answers.length === 0) {
        setStatus({
          kind: "error",
          message:
            "感想から評価項目を読み取れませんでした。酸味や甘さなど、項目に触れるように話してみてください。",
        });
        return;
      }
      onSummarized(answers);
    } catch {
      setStatus({
        kind: "error",
        message:
          "記録へのまとめに失敗しました。時間をおいて試すか、フォームで入力してください。",
      });
    }
  }

  return (
    <div className="voice-cupping">
      <h1 className="cupping-setup-title">話して記録する</h1>
      <p className="cupping-setup-description">
        飲みながら感じたことを自由に話してください。
        {criteria.map((c) => c.label).join("・")}
        について触れると、端末内のAIが記録にまとめます。
      </p>

      {speechSupported && (
        <button
          type="button"
          className={`voice-cupping-mic${speech.listening ? " is-listening" : ""}`}
          onClick={speech.listening ? speech.stop : speech.start}
          disabled={busy}
        >
          {speech.listening ? "■ 録音を止める" : "● 録音をはじめる"}
        </button>
      )}
      {speech.error && (
        <p className="voice-cupping-error" role="alert">
          音声を認識できませんでした（{speech.error}
          ）。マイクの許可を確認してください。
        </p>
      )}

      <label className="cupping-setup-label" htmlFor="voice-transcript">
        {speechSupported ? "文字起こし（修正できます）" : "感想"}
      </label>
      <textarea
        id="voice-transcript"
        className="cupping-note voice-cupping-transcript"
        placeholder="例：甘さはキャラメルみたいで強め。酸味はレモンっぽくて明るい。全体的にすごく好み。"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        disabled={busy}
      />
      {speech.interim && (
        <p className="voice-cupping-interim" aria-live="polite">
          {speech.interim}
        </p>
      )}

      {status.kind === "summarizing" && (
        <p className="voice-cupping-status" aria-live="polite">
          {status.downloaded !== undefined && status.downloaded < 1
            ? `AIモデルをダウンロード中… ${Math.round(status.downloaded * 100)}%`
            : "記録にまとめています…"}
        </p>
      )}
      {status.kind === "error" && (
        <p className="voice-cupping-error" role="alert">
          {status.message}
        </p>
      )}

      <button
        type="button"
        className="primary-button"
        onClick={summarize}
        disabled={busy || transcript.trim() === ""}
      >
        記録にまとめる
      </button>
      <button type="button" className="secondary-button" onClick={onUseForm}>
        フォームで入力する
      </button>
      <button type="button" className="text-button" onClick={onBack}>
        コーヒー情報に戻る
      </button>
    </div>
  );
}
