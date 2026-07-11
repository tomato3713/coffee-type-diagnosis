import type { Ref } from "react";
import type { FlavorCategory, ResultType } from "../types";

interface Props {
  type: ResultType;
  flavors: FlavorCategory[];
  diagnosedAt: string;
  ref?: Ref<HTMLDivElement>;
}

// 画面表示と PNG 出力（html-to-image）で共用するカード。
// 画像化するため Web フォントや外部画像は使わない
export function ResultCard({ type, flavors, diagnosedAt, ref }: Props) {
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
          <time dateTime={diagnosedAt}>
            {new Date(diagnosedAt).toLocaleDateString("ja-JP")}
          </time>
        </div>
        <p className="result-card-url">{`${location.origin}${import.meta.env.BASE_URL}`}</p>
      </footer>
    </div>
  );
}
