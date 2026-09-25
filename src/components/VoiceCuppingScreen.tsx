import { useEffect, useRef, useState } from "react";
import type { CuppingCriterionDef } from "../data/cupping";
import type { CuppingCriterionAnswer } from "../types";
import { createTastingSession, summarizeTasting } from "../voice/promptApi";
import {
  isSpeechRecognitionSupported,
  useSpeechRecognition,
} from "../voice/speechRecognition";

interface Props {
  criteria: CuppingCriterionDef[];
  // 検証を通った項目の回答を渡す。通常は全項目揃うが、モデルの出力が
  // 一部不正だと欠けることがある
  onSummarized: (answers: CuppingCriterionAnswer[]) => void;
  onUseForm: () => void;
  onBack: () => void;
  // Storybook で文字起こし済みの状態を再現するために使う
  initialTranscript?: string;
}

type Status =
  | { kind: "idle" }
  | { kind: "summarizing" }
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
  // モデルのダウンロード進捗（0〜1）。ダウンロードが走らなければ null のまま
  const [downloaded, setDownloaded] = useState<number | null>(null);
  const sessionRef = useRef<Promise<LanguageModel> | null>(null);

  // 失敗したら ref を空に戻し、次の呼び出しで作り直せるようにする
  function ensureSession(): Promise<LanguageModel> {
    if (!sessionRef.current) {
      const promise = createTastingSession(criteria, setDownloaded);
      sessionRef.current = promise;
      promise.catch(() => {
        if (sessionRef.current === promise) sessionRef.current = null;
      });
    }
    return sessionRef.current;
  }

  // セットアップ画面の「話して記録する」押下直後にマウントされるので、
  // そのユーザー操作の有効期間内にモデルのダウンロードを始められる。
  // 話している間に裏でダウンロードを進め、初回の待ち時間を隠すため。
  // ここで失敗しても「記録にまとめる」押下時に作り直す
  // biome-ignore lint/correctness/useExhaustiveDependencies: ensureSession は毎レンダー作り直されるが、criteria が同じなら作るセッションも同じため
  useEffect(() => {
    const promise = ensureSession();
    return () => {
      sessionRef.current = null;
      promise.then((s) => s.destroy()).catch(() => {});
    };
  }, [criteria]);

  async function summarize() {
    speech.stop();
    setStatus({ kind: "summarizing" });
    try {
      const answers = await summarizeTasting(
        await ensureSession(),
        criteria,
        transcript,
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
        飲みながら感じたことを自由に話してください。端末内のAIが記録にまとめます。
      </p>

      {/* 項目ごとの問いかけはフォーム入力と同じ文言を使う。話す内容の
          ヒントを別に書くと、フォームと音声で聞いていることがずれるため */}
      <section
        className="voice-cupping-guide"
        aria-labelledby="voice-guide-title"
      >
        <h2 id="voice-guide-title" className="voice-cupping-guide-title">
          こんなことを話してみてください
        </h2>
        <ul className="voice-cupping-guide-list">
          {criteria.map((c) => (
            <li key={c.id}>
              <span className="voice-cupping-guide-label">{c.label}</span>
              {c.prompt}
            </li>
          ))}
        </ul>
        <p className="voice-cupping-guide-note">
          すべてに触れなくても大丈夫です。話さなかった項目は感想全体から推定し、あとで結果ページから直せます。
        </p>
      </section>

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

      {downloaded !== null && downloaded < 1 && (
        <p className="voice-cupping-status" aria-live="polite">
          AIモデルを準備中… {Math.round(downloaded * 100)}%
          （話している間に進めておきます）
        </p>
      )}
      {status.kind === "summarizing" && (
        <p className="voice-cupping-status" aria-live="polite">
          記録にまとめています…
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
