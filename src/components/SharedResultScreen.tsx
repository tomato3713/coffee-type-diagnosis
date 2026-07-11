import { useRef } from "react";
import { findFlavorCategory, RESULT_TYPES } from "../data/results";
import type { SharedResult } from "../logic/share";
import { ResultCard } from "./ResultCard";
import { ShareButtons } from "./ShareButtons";

interface Props {
  result: SharedResult;
  onStart: () => void;
  onShowTree: () => void;
  onBackToTop: () => void;
}

// シェアされた URL から開いた結果の閲覧画面。履歴には保存しない
export function SharedResultScreen({
  result,
  onStart,
  onShowTree,
  onBackToTop,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const type = RESULT_TYPES[result.typeId];
  if (!type) return null;

  return (
    <div className="result">
      <ResultCard
        ref={cardRef}
        type={type}
        flavors={result.flavorIds.map(findFlavorCategory)}
      />
      <ShareButtons
        type={type}
        flavorIds={result.flavorIds}
        cardRef={cardRef}
      />
      <div className="result-actions">
        <button type="button" className="primary-button" onClick={onStart}>
          私も診断してみる
        </button>
        <button type="button" className="secondary-button" onClick={onShowTree}>
          フレーバーツリーで確認する
        </button>
        <button type="button" className="text-button" onClick={onBackToTop}>
          トップへ
        </button>
      </div>
    </div>
  );
}
