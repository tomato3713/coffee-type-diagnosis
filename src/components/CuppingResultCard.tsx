import { useState, type Ref } from "react";
import { CUPPING_CRITERIA } from "../data/cupping";
import { PROCESS_METHODS } from "../data/results";
import {
  averageScore,
  composeCuppingSummary,
  totalScore,
} from "../logic/cupping";
import type { CuppingHistoryEntry } from "../types";

interface Props {
  entry: CuppingHistoryEntry;
  // 指定すると各項目のタイルがクリック可能になり、そのIDでコールバックする
  onSelectCriterion?: (index: number) => void;
  // 指定するとコーヒー名のh1がクリック可能になりインライン編集できる
  onNameChange?: (name: string) => void;
  ref?: Ref<HTMLDivElement>;
}

// 画面表示と PNG 出力（html-to-image）で共用するカード。
// 画像化するため Web フォントや外部画像は使わない
export function CuppingResultCard({
  entry,
  onSelectCriterion,
  onNameChange,
  ref,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(entry.coffeeName);

  const summary = composeCuppingSummary(entry.answers);

  function commitName() {
    setEditingName(false);
    if (onNameChange) onNameChange(nameValue);
  }

  return (
    <div className="cupping-card" ref={ref}>
      <p className="cupping-card-heading">カッピング記録</p>
      {onNameChange ? (
        editingName ? (
          <input
            className="cupping-card-name-input"
            // biome-ignore lint/a11y/noAutofocus: クリックで即座に編集できるようにするため
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setNameValue(entry.coffeeName);
                setEditingName(false);
              }
            }}
          />
        ) : (
          <h1
            className="cupping-card-name cupping-card-name--editable"
            onClick={() => {
              setNameValue(entry.coffeeName);
              setEditingName(true);
            }}
          >
            {entry.coffeeName || "名前未記入のコーヒー"}
          </h1>
        )
      ) : (
        <h1 className="cupping-card-name">
          {entry.coffeeName || "名前未記入のコーヒー"}
        </h1>
      )}
      {entry.imageDataUrl && (
        <img
          src={entry.imageDataUrl}
          alt={entry.coffeeName || "コーヒーの写真"}
          className="cupping-card-image"
        />
      )}
      {(entry.variety || entry.processMethod || entry.purchaseLocation) && (
        <dl className="cupping-card-meta">
          {entry.variety && (
            <div>
              <dt>品種</dt>
              <dd>{entry.variety}</dd>
            </div>
          )}
          {entry.processMethod && (
            <div>
              <dt>精製方法</dt>
              <dd>{PROCESS_METHODS[entry.processMethod].label}</dd>
            </div>
          )}
          {entry.purchaseLocation && (
            <div>
              <dt>購入場所</dt>
              <dd>{entry.purchaseLocation}</dd>
            </div>
          )}
        </dl>
      )}
      {summary && <p className="cupping-card-summary-text">{summary}</p>}
      <dl className="cupping-card-summary">
        <div>
          <dt>合計スコア</dt>
          <dd>{totalScore(entry.answers)} / 80</dd>
        </div>
        <div>
          <dt>平均スコア</dt>
          <dd>{averageScore(entry.answers)} / 10</dd>
        </div>
      </dl>
      <section className="cupping-card-criteria">
        {CUPPING_CRITERIA.map((criterion, i) => {
          const answer = entry.answers[i];
          const body = (
            <>
              <p className="cupping-card-criterion-label">{criterion.label}</p>
              {answer.note && (
                <p className="cupping-card-criterion-note">{answer.note}</p>
              )}
              <p className="cupping-card-criterion-score">
                {answer.score} / 10
              </p>
              {answer.tags.length > 0 && (
                <p className="cupping-card-criterion-tags">
                  {answer.tags.join("・")}
                </p>
              )}
            </>
          );
          return onSelectCriterion ? (
            <button
              type="button"
              className="cupping-card-criterion cupping-card-criterion-button"
              key={criterion.id}
              onClick={() => onSelectCriterion(i)}
            >
              {body}
            </button>
          ) : (
            <div className="cupping-card-criterion" key={criterion.id}>
              {body}
            </div>
          );
        })}
      </section>
      <footer className="cupping-card-footer">
        <div className="cupping-card-footer-row">
          <span>コーヒータイプ診断 カッピング</span>
          <time dateTime={entry.cuppedAt}>
            {new Date(entry.cuppedAt).toLocaleDateString("ja-JP")}
          </time>
        </div>
        <p className="cupping-card-url">{`${location.origin}${import.meta.env.BASE_URL}`}</p>
      </footer>
    </div>
  );
}
