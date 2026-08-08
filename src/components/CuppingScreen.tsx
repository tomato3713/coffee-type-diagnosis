import { useState } from "react";
import { CUPPING_CRITERIA } from "../data/cupping";
import { CUPPING_CRITERION_COUNT, cuppingProgress } from "../logic/cupping";
import type { CuppingCriterionAnswer, CuppingScore } from "../types";

interface Props {
  onComplete: (answers: CuppingCriterionAnswer[]) => void;
  // 既存の回答を編集する場合に渡す。渡さなければ空欄から入力を始める
  initialAnswers?: CuppingCriterionAnswer[];
  initialCursor?: number;
}

// 入力中の1項目分の状態。touched=false はスライダー未操作（未回答）を表す
interface Draft {
  score: CuppingScore;
  touched: boolean;
  tags: string[];
  note: string;
}

const DEFAULT_SCORE: CuppingScore = 5;

function emptyDrafts(): Draft[] {
  return CUPPING_CRITERIA.map(() => ({
    score: DEFAULT_SCORE,
    touched: false,
    tags: [],
    note: "",
  }));
}

function draftsFromAnswers(answers: CuppingCriterionAnswer[]): Draft[] {
  return answers.map((a) => ({
    score: a.score,
    touched: true,
    tags: a.tags,
    note: a.note,
  }));
}

export function CuppingScreen({
  onComplete,
  initialAnswers,
  initialCursor,
}: Props) {
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    initialAnswers ? draftsFromAnswers(initialAnswers) : emptyDrafts(),
  );
  const [cursor, setCursor] = useState(initialCursor ?? 0);

  // touched=true の連続した先頭ブロックが「回答済み」。
  // cursor より前の項目は必ず touched になっている（次へ進む条件のため）
  const firstUntouched = drafts.findIndex((d) => !d.touched);
  const answeredCount =
    firstUntouched === -1 ? CUPPING_CRITERION_COUNT : firstUntouched;

  const criterion = CUPPING_CRITERIA[cursor];
  const draft = drafts[cursor];
  const progress = cuppingProgress(Math.min(answeredCount, cursor));
  const isLast = cursor === CUPPING_CRITERION_COUNT - 1;
  // 編集時は全項目のスコアが既に確定しているため、途中からでも結果に戻れる
  const isEditing = initialAnswers !== undefined;

  function updateDraft(patch: Partial<Draft>) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === cursor ? { ...d, ...patch } : d)),
    );
  }

  function toggleTag(tag: string) {
    const tags = draft.tags.includes(tag)
      ? draft.tags.filter((t) => t !== tag)
      : [...draft.tags, tag];
    updateDraft({ tags });
  }

  function finish() {
    onComplete(
      drafts.map((d, i) => ({
        criterionId: CUPPING_CRITERIA[i].id,
        score: d.score,
        tags: d.tags,
        note: d.note,
      })),
    );
  }

  function next() {
    if (!draft.touched) return;
    if (isLast) {
      finish();
      return;
    }
    setCursor(cursor + 1);
  }

  return (
    <div className="cupping">
      <p className="cupping-stage">
        {cursor + 1} / {CUPPING_CRITERION_COUNT}　{criterion.label}
      </p>
      <progress
        className="cupping-progress"
        value={progress.value}
        max={progress.max}
      />
      <nav className="cupping-map" aria-label="評価項目の一覧">
        {CUPPING_CRITERIA.map((c, i) => {
          const state =
            i === cursor
              ? " is-current"
              : i < answeredCount
                ? " is-answered"
                : "";
          return (
            <button
              type="button"
              key={c.id}
              className={`cupping-map-dot${state}`}
              aria-label={`${c.label}へ`}
              disabled={i > answeredCount}
              onClick={() => setCursor(i)}
            />
          );
        })}
      </nav>

      <h1 className="cupping-criterion-label">{criterion.label}</h1>
      <p className="cupping-criterion-description">{criterion.description}</p>
      <p className="cupping-question">{criterion.prompt}</p>

      <div className="cupping-score">
        <div className="cupping-score-labels">
          <span className="cupping-score-label">
            1: {criterion.scoreLowLabel}
          </span>
          <span className="cupping-score-label cupping-score-label--right">
            {criterion.scoreHighLabel} :10
          </span>
        </div>
        <div className="cupping-score-slider-row">
          <input
            type="range"
            className="cupping-score-slider"
            min={1}
            max={10}
            step={1}
            value={draft.score}
            onChange={(e) =>
              updateDraft({
                score: Number(e.target.value) as CuppingScore,
                touched: true,
              })
            }
          />
          <span className={`cupping-score-value${draft.touched ? "" : " is-untouched"}`}>
            {draft.touched ? draft.score : "—"}
          </span>
        </div>
        {!draft.touched && (
          <p className="cupping-score-hint">スライダーを動かしてスコアを選んでください</p>
        )}
      </div>

      <div className="cupping-tags">
        {criterion.tagOptions.map((tag) => (
          <button
            type="button"
            key={tag}
            className={`cupping-tag${draft.tags.includes(tag) ? " is-selected" : ""}`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <textarea
        className="cupping-note"
        placeholder="気づいたことを自由に書いてみましょう（任意）"
        value={draft.note}
        onChange={(e) => updateDraft({ note: e.target.value })}
      />

      <div className="cupping-nav">
        <button
          type="button"
          className="cupping-nav-button"
          onClick={() => setCursor(cursor - 1)}
          disabled={cursor === 0}
        >
          ← 前の項目
        </button>
        <div className="cupping-nav-right">
          {isEditing && !isLast && (
            <button type="button" className="secondary-button" onClick={finish}>
              保存して結果に戻る
            </button>
          )}
          <button
            type="button"
            className="primary-button"
            onClick={next}
            disabled={!draft.touched}
          >
            {isLast ? "結果を見る" : "次の項目 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
