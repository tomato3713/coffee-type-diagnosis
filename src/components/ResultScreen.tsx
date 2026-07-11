import { useRef, useState } from "react";
import { findFlavorCategory, RESULT_TYPES } from "../data/results";
import type { HistoryEntry } from "../types";
import { captureCardPng } from "./cardCapture";
import { ResultCard } from "./ResultCard";
import { ShareButtons } from "./ShareButtons";

interface Props {
  entry: HistoryEntry;
  onRestart: () => void;
  onBackToTop: () => void;
  onShowTree: () => void;
}

export function ResultScreen({
  entry,
  onRestart,
  onBackToTop,
  onShowTree,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const type = RESULT_TYPES[entry.typeId];
  if (!type) return null;

  async function download() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await captureCardPng(cardRef.current);
      const link = document.createElement("a");
      link.download = `coffee-type-${entry.typeId}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="result">
      <ResultCard
        ref={cardRef}
        type={type}
        flavors={entry.flavorIds.map(findFlavorCategory)}
        diagnosedAt={entry.diagnosedAt}
      />
      <ShareButtons type={type} flavorIds={entry.flavorIds} cardRef={cardRef} />
      <div className="result-actions">
        <button
          type="button"
          className="primary-button"
          onClick={download}
          disabled={saving}
        >
          {saving ? "保存中…" : "画像として保存"}
        </button>
        <button type="button" className="secondary-button" onClick={onShowTree}>
          フレーバーツリーで確認する
        </button>
        <button type="button" className="secondary-button" onClick={onRestart}>
          もう一度診断する
        </button>
        <button type="button" className="text-button" onClick={onBackToTop}>
          トップへ戻る
        </button>
      </div>
    </div>
  );
}
