import type { Ref } from "react";
import { findRoastLevel, PROCESS_METHODS, ROAST_LEVELS } from "../data/results";
import type { FlavorCategory, ResultType } from "../types";

interface Props {
  type: ResultType;
  flavors: FlavorCategory[];
  // シェア閲覧では日付を持たないため省略可
  diagnosedAt?: string;
  ref?: Ref<HTMLDivElement>;
}

// 画面表示と PNG 出力（html-to-image）で共用するカード。
// 画像化するため Web フォントや外部画像は使わない
export function ResultCard({ type, flavors, diagnosedAt, ref }: Props) {
  const roast = findRoastLevel(type.roast);
  const process = PROCESS_METHODS[type.process];
  return (
    <div className="result-card" ref={ref}>
      <p className="result-card-heading">あなたのコーヒータイプは</p>
      <h1 className="result-card-name">{type.name}</h1>
      <p className="result-card-description">{type.description}</p>
      <dl className="result-card-facts">
        <div>
          <dt>品種</dt>
          <dd>{type.variety}</dd>
        </div>
        <div>
          <dt>産地</dt>
          <dd>{type.origin}</dd>
        </div>
        <div>
          <dt>飲み方</dt>
          <dd>{type.brewing}</dd>
        </div>
      </dl>
      <section className="result-card-roast">
        <h2>焙煎度</h2>
        <div className="result-card-roast-scale">
          {ROAST_LEVELS.map((r) => (
            <span
              key={r.level}
              className={`result-card-roast-dot${r.level === roast.level ? " is-active" : ""}`}
              style={{ background: r.color }}
            />
          ))}
        </div>
        <div className="result-card-roast-ends" aria-hidden="true">
          <span>浅煎り</span>
          <span>深煎り</span>
        </div>
        <p className="result-card-roast-label">
          {roast.label}
          <span className="result-card-roast-step">
            （8段階中 {roast.level} 段階目）
          </span>
        </p>
        <p className="result-card-roast-description">{roast.description}</p>
      </section>
      <section className="result-card-process">
        <h2>精製方法</h2>
        <p className="result-card-process-label">{process.label}</p>
        <p className="result-card-process-description">{process.description}</p>
      </section>
      <section className="result-card-flavors">
        <h2>好みのフレーバー</h2>
        {flavors.map((flavor) => (
          <div className="result-card-flavor" key={flavor.id}>
            <p className="result-card-flavor-wheel">{flavor.wheelCategory}</p>
            <p className="result-card-flavor-label">{flavor.label}</p>
            <p className="result-card-flavor-notes">
              {flavor.notes.join("・")}
            </p>
          </div>
        ))}
        <p className="result-card-credit">
          SCA フレーバーホイール（2016年版）に基づく分類
        </p>
      </section>
      <footer className="result-card-footer">
        <div className="result-card-footer-row">
          <span>コーヒータイプ診断</span>
          {diagnosedAt && (
            <time dateTime={diagnosedAt}>
              {new Date(diagnosedAt).toLocaleDateString("ja-JP")}
            </time>
          )}
        </div>
        <p className="result-card-url">{`${location.origin}${import.meta.env.BASE_URL}`}</p>
      </footer>
    </div>
  );
}
