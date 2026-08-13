import { useState } from "react";
import type { CuppingCriterionDef } from "../data/cupping";
import { cuppingProgress } from "../logic/cupping";
import type { CuppingCriterionAnswer, CuppingScore } from "../types";

// 1問目から情報入力画面へ戻る際に、入力中だった内容を持ち運ぶための型
export interface CuppingFirstDraft {
  score: CuppingScore;
  tags: string[];
  note: string;
}

interface Props {
  // 評価する項目の配列。詳細モードは8件、簡易モードは4件、
  // アップグレード再開時は8件（うち一部は回答済み）を渡す
  criteria: CuppingCriterionDef[];
  onComplete: (answers: CuppingCriterionAnswer[]) => void;
  // 渡すと1問目の「前へ」で情報入力画面に戻れる。編集モードでは渡さない。
  // 戻る時点の1問目の入力内容（未操作なら undefined）を引数で受け取る
  onBackToSetup?: (firstDraft?: CuppingFirstDraft) => void;
  // 既存の回答を編集する場合に渡す。criteria全件と一致しない
  // 部分回答（アップグレード時）も渡せる。渡さなければ空欄から入力を始める
  initialAnswers?: CuppingCriterionAnswer[];
  initialCursor?: number;
  // 情報入力画面から戻ってきたときに1問目の入力内容を復元する
  initialFirstDraft?: CuppingFirstDraft;
}

// 入力中の1項目分の状態。touched=false はスライダー未操作（未回答）を表す
interface Draft {
  score: CuppingScore;
  touched: boolean;
  tags: string[];
  note: string;
}

const DEFAULT_SCORE: CuppingScore = 5;

function emptyDrafts(
  criteria: CuppingCriterionDef[],
  firstDraft?: CuppingFirstDraft,
): Draft[] {
  return criteria.map((_, i) =>
    i === 0 && firstDraft
      ? {
          score: firstDraft.score,
          touched: true,
          tags: firstDraft.tags,
          note: firstDraft.note,
        }
      : { score: DEFAULT_SCORE, touched: false, tags: [], note: "" },
  );
}

// criteria の各項目について、answers に該当する回答があれば touched な
// Draft、なければ未回答Draftを補う。全件揃った編集も、アップグレード時の
// 部分回答（一部項目だけ回答済み）からの再開も、この1関数でカバーする
function draftsFromPartialAnswers(
  criteria: CuppingCriterionDef[],
  answers: CuppingCriterionAnswer[],
): Draft[] {
  return criteria.map((c) => {
    const a = answers.find((x) => x.criterionId === c.id);
    return a
      ? { score: a.score, touched: true, tags: a.tags, note: a.note }
      : { score: DEFAULT_SCORE, touched: false, tags: [], note: "" };
  });
}

export function CuppingScreen({
  criteria,
  onComplete,
  onBackToSetup,
  initialAnswers,
  initialCursor,
  initialFirstDraft,
}: Props) {
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    initialAnswers
      ? draftsFromPartialAnswers(criteria, initialAnswers)
      : emptyDrafts(criteria, initialFirstDraft),
  );
  const [cursor, setCursor] = useState(initialCursor ?? 0);

  // 編集時は全項目のスコアが既に確定しているため、途中からでも結果に戻れる
  const isEditing = initialAnswers !== undefined;
  const allTouched = drafts.every((d) => d.touched);

  // 新規入力時は touched=true の連続した先頭ブロックが「回答済み」
  // （cursorより前は必ずtouched）。編集時はアップグレードで非連続に
  // touched/untouchedが混在しうるため、単純にtouched数を数える
  const firstUntouched = drafts.findIndex((d) => !d.touched);
  const answeredCount = isEditing
    ? drafts.filter((d) => d.touched).length
    : firstUntouched === -1
      ? criteria.length
      : firstUntouched;

  const criterion = criteria[cursor];
  const draft = drafts[cursor];
  const progress = cuppingProgress(
    Math.min(answeredCount, cursor),
    criteria.length,
  );
  const isLast = cursor === criteria.length - 1;

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
    // アップグレード再開時は未回答項目が残ったまま丸ドットで最後の項目へ
    // 直接ジャンプできてしまうため、全項目touched前提のここでガードする
    if (!allTouched) return;
    onComplete(
      drafts.map((d, i) => ({
        criterionId: criteria[i].id,
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
        {cursor + 1} / {criteria.length}　{criterion.label}
      </p>
      <progress
        className="cupping-progress"
        value={progress.value}
        max={progress.max}
      />
      <nav className="cupping-map" aria-label="評価項目の一覧">
        {criteria.map((c, i) => {
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
              // 編集中（通常の見直し・アップグレード再開）はどの項目にも
              // 自由に移動できる。新規入力時のみ未回答より先へは進めない
              disabled={!isEditing && i > answeredCount}
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
            className={`cupping-score-slider${draft.touched ? "" : " is-untouched"}`}
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
          <span
            className={`cupping-score-value${draft.touched ? "" : " is-untouched"}`}
          >
            {draft.touched ? draft.score : "—"}
          </span>
        </div>
        {!draft.touched && (
          <p className="cupping-score-hint">
            スライダーを動かしてスコアを選んでください
          </p>
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
          onClick={() => {
            if (cursor === 0 && onBackToSetup) {
              onBackToSetup(
                draft.touched
                  ? { score: draft.score, tags: draft.tags, note: draft.note }
                  : undefined,
              );
            } else {
              setCursor(cursor - 1);
            }
          }}
          disabled={cursor === 0 && !onBackToSetup}
        >
          {cursor === 0 && onBackToSetup ? "← 情報入力に戻る" : "← 前の項目"}
        </button>
        <div className="cupping-nav-right">
          {isEditing && !isLast && allTouched && (
            <button type="button" className="secondary-button" onClick={finish}>
              保存して結果に戻る
            </button>
          )}
          <button
            type="button"
            className="primary-button"
            onClick={next}
            disabled={!draft.touched || (isLast && !allTouched)}
          >
            {isLast ? "結果を見る" : "次の項目 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
