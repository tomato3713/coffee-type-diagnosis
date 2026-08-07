import { useState } from "react";

interface Props {
  onStart: (coffeeName: string) => void;
  onBackToTop: () => void;
}

export function CuppingSetupScreen({ onStart, onBackToTop }: Props) {
  const [coffeeName, setCoffeeName] = useState("");

  return (
    <div className="cupping-setup">
      <h1 className="cupping-setup-title">カッピング記録</h1>
      <p className="cupping-setup-description">
        評価するコーヒーの情報を入力してください
      </p>
      <label className="cupping-setup-label" htmlFor="setup-coffee-name">
        コーヒー名
      </label>
      <input
        id="setup-coffee-name"
        className="cupping-coffee-name"
        type="text"
        placeholder="例：エチオピア イルガチェフェ G1"
        value={coffeeName}
        onChange={(e) => setCoffeeName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onStart(coffeeName);
        }}
        autoFocus
      />
      <button
        type="button"
        className="primary-button"
        onClick={() => onStart(coffeeName)}
      >
        カッピングをはじめる
      </button>
      <button type="button" className="text-button" onClick={onBackToTop}>
        トップへ戻る
      </button>
    </div>
  );
}
