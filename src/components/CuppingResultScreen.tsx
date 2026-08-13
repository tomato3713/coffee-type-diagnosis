import { useRef, useState } from "react";
import { cuppingModeOf } from "../logic/cupping";
import { isTouchDevice } from "../logic/device";
import type { CuppingHistoryEntry } from "../types";
import { CuppingResultCard } from "./CuppingResultCard";
import { captureCardPngFile } from "./cardCapture";

interface Props {
  entry: CuppingHistoryEntry;
  onRestart: () => void;
  onBackToTop: () => void;
  onEditCriterion: (index: number) => void;
  onUpdateCoffeeName: (name: string) => void;
  onEditCoffeeInfo: () => void;
  // 簡易モードのエントリのときだけボタンを表示する。detailedへの
  // アップグレード専用で、逆方向（detailed→simple）は提供しない
  onUpgradeToDetailed: () => void;
}

export function CuppingResultScreen({
  entry,
  onRestart,
  onBackToTop,
  onEditCriterion,
  onUpdateCoffeeName,
  onEditCoffeeInfo,
  onUpgradeToDetailed,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  async function download() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const file = await captureCardPngFile(
        cardRef.current,
        `coffee-cupping-${entry.id}.png`,
      );
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
    <div className="cupping-result">
      <CuppingResultCard
        ref={cardRef}
        entry={entry}
        onSelectCriterion={onEditCriterion}
        onNameChange={onUpdateCoffeeName}
      />
      <div className="cupping-result-actions">
        <button
          type="button"
          className="primary-button"
          onClick={download}
          disabled={saving}
        >
          {saving ? "保存中…" : "画像として保存"}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={onEditCoffeeInfo}
        >
          コーヒー情報を編集
        </button>
        {cuppingModeOf(entry) === "simple" && (
          <div className="cupping-result-upgrade">
            <button
              type="button"
              className="secondary-button"
              onClick={onUpgradeToDetailed}
            >
              詳細記録に切り替える
            </button>
            <p className="cupping-result-hint">残り4項目を追加入力できます</p>
          </div>
        )}
        <button type="button" className="secondary-button" onClick={onRestart}>
          もう一度カッピングする
        </button>
        <button type="button" className="text-button" onClick={onBackToTop}>
          トップへ戻る
        </button>
      </div>
    </div>
  );
}
