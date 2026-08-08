import { useRef, useState } from "react";
import { PROCESS_METHODS } from "../data/results";
import type { CoffeeInfo, ProcessMethodId } from "../types";

interface Props {
  onStart: (info: CoffeeInfo) => void;
  onBackToTop: () => void;
}

async function resizeImageToDataUrl(file: File): Promise<string> {
  const MAX_SIZE = 600;
  const QUALITY = 0.7;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      // biome-ignore lint/style/noNonNullAssertion: canvas要素のgetContext("2d")は常にnon-null
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", QUALITY));
    };
    img.src = url;
  });
}

export function CuppingSetupScreen({ onStart, onBackToTop }: Props) {
  const [coffeeName, setCoffeeName] = useState("");
  const [variety, setVariety] = useState("");
  const [processMethod, setProcessMethod] = useState<ProcessMethodId | "">("");
  const [purchaseLocation, setPurchaseLocation] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImageToDataUrl(file);
    setImageDataUrl(dataUrl);
  }

  function handleStart() {
    onStart({
      coffeeName,
      variety: variety || undefined,
      processMethod: processMethod || undefined,
      purchaseLocation: purchaseLocation || undefined,
      imageDataUrl,
    });
  }

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
          if (e.key === "Enter" && !e.nativeEvent.isComposing) handleStart();
        }}
        autoFocus
      />

      <label className="cupping-setup-label" htmlFor="setup-variety">
        品種
        <span className="cupping-setup-optional">（任意）</span>
      </label>
      <input
        id="setup-variety"
        className="cupping-coffee-name"
        type="text"
        placeholder="例：ゲイシャ、ブルボン"
        value={variety}
        onChange={(e) => setVariety(e.target.value)}
      />

      <label className="cupping-setup-label" htmlFor="setup-process">
        精製方法
        <span className="cupping-setup-optional">（任意）</span>
      </label>
      <select
        id="setup-process"
        className="cupping-setup-select"
        value={processMethod}
        onChange={(e) => setProcessMethod(e.target.value as ProcessMethodId | "")}
      >
        <option value="">選択してください</option>
        {Object.values(PROCESS_METHODS).map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>

      <label className="cupping-setup-label" htmlFor="setup-purchase-location">
        購入場所
        <span className="cupping-setup-optional">（任意）</span>
      </label>
      <input
        id="setup-purchase-location"
        className="cupping-coffee-name"
        type="text"
        placeholder="例：〇〇コーヒーロースターズ"
        value={purchaseLocation}
        onChange={(e) => setPurchaseLocation(e.target.value)}
      />

      <label className="cupping-setup-label" htmlFor="setup-image">
        写真
        <span className="cupping-setup-optional">（任意）</span>
      </label>
      <div className="cupping-setup-image-area">
        {imageDataUrl ? (
          <div className="cupping-setup-image-preview">
            <img src={imageDataUrl} alt="選択した写真" className="cupping-setup-preview-img" />
            <button
              type="button"
              className="cupping-setup-image-remove"
              onClick={() => {
                setImageDataUrl(undefined);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              削除
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="cupping-setup-image-button"
            onClick={() => fileInputRef.current?.click()}
          >
            写真を選択
          </button>
        )}
        <input
          ref={fileInputRef}
          id="setup-image"
          type="file"
          accept="image/*"
          className="cupping-setup-file-input"
          onChange={handleImageChange}
        />
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={handleStart}
      >
        カッピングをはじめる
      </button>
      <button type="button" className="text-button" onClick={onBackToTop}>
        トップへ戻る
      </button>
    </div>
  );
}
