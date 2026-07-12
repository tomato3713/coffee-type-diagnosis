import { useRef, useState } from "react";
import { composeResultType, findFlavorCategory } from "../data/results";
import { isTouchDevice } from "../logic/device";
import type { HistoryEntry } from "../types";
import { captureCardPngFile } from "./cardCapture";
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
  const type = composeResultType(entry.typeId, entry.roast, entry.process);
  if (!type) return null;

  async function download() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const file = await captureCardPngFile(cardRef.current, entry.typeId);
      // スマホの <a download> は「ファイル」アプリ行きになるため、
      // 共有シートを開いて「画像を保存」で写真アプリに保存できるようにする
      if (isTouchDevice() && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (e) {
          // キャンセルは何もしない。それ以外はダウンロードに縮退する
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.download = file.name;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
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
