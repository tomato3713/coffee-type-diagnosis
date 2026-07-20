import { useState } from "react";
import { CUPPING_CRITERIA } from "../data/cupping";
import { CUPPING_CRITERION_COUNT, cuppingProgress } from "../logic/cupping";
import type { CuppingCriterionAnswer, CuppingScore } from "../types";

interface Props {
  onComplete: (answers: CuppingCriterionAnswer[]) => void;
}

// 未回答（スコア未選択）を許す入力中の1項目分の状態
interface Draft {
  score: CuppingScore | null;
  tags: string[];
  note: string;
}

const SCORES: CuppingScore[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function emptyDrafts(): Draft[] {
  return CUPPING_CRITERIA.map(() => ({ score: null, tags: [], note: "" }));
}

export function CuppingScreen({ onComplete }: Props) {
  const [drafts, setDrafts] = useState<Draft[]>(emptyDrafts);
  const [cursor, setCursor] = useState(0);

  // 現在の draft より前は必ずスコアが確定している（次へ進む条件のため）。
  // 最初の未回答位置までが「回答済み件数」になる
  const firstUnanswered = drafts.findIndex((d) => d.score === null);
  const answeredCount =
    firstUnanswered === -1 ? CUPPING_CRITERION_COUNT : firstUnanswered;

  const criterion = CUPPING_CRITERIA[cursor];
  const draft = drafts[cursor];
  const progress = cuppingProgress(Math.min(answeredCount, cursor));
  const isLast = cursor === CUPPING_CRITERION_COUNT - 1;

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

  function next() {
    if (draft.score === null) return;
    if (isLast) {
      onComplete(
        drafts.map((d, i) => ({
          criterionId: CUPPING_CRITERIA[i].id,
          // biome-ignore lint/style/noNonNullAssertion: isLast到達時は全項目のスコアが確定している
          score: d.score!,
          tags: d.tags,
          note: d.note,
        })),
      );
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
        {SCORES.map((score) => (
          <button
            type="button"
            key={score}
            className={`cupping-score-button${draft.score === score ? " is-selected" : ""}`}
            onClick={() => updateDraft({ score })}
          >
            {score}
          </button>
        ))}
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
        <button
          type="button"
          className="primary-button"
          onClick={next}
          disabled={draft.score === null}
        >
          {isLast ? "結果を見る" : "次の項目 →"}
        </button>
      </div>
    </div>
  );
}
