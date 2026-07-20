import type { Ref } from "react";
import { CUPPING_CRITERIA } from "../data/cupping";
import { averageScore, totalScore } from "../logic/cupping";
import type { CuppingHistoryEntry } from "../types";

interface Props {
  entry: CuppingHistoryEntry;
  ref?: Ref<HTMLDivElement>;
}

// 画面表示と PNG 出力（html-to-image）で共用するカード。
// 画像化するため Web フォントや外部画像は使わない
export function CuppingResultCard({ entry, ref }: Props) {
  return (
    <div className="cupping-card" ref={ref}>
      <p className="cupping-card-heading">カッピング記録</p>
      <h1 className="cupping-card-name">
        {entry.coffeeName || "名前未記入のコーヒー"}
      </h1>
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
          return (
            <div className="cupping-card-criterion" key={criterion.id}>
              <p className="cupping-card-criterion-label">
                {criterion.label}
                <span className="cupping-card-criterion-score">
                  {answer.score} / 10
                </span>
              </p>
              {answer.tags.length > 0 && (
                <p className="cupping-card-criterion-tags">
                  {answer.tags.join("・")}
                </p>
              )}
              {answer.note && (
                <p className="cupping-card-criterion-note">{answer.note}</p>
              )}
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
