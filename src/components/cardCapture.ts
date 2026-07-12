import { toBlob } from "html-to-image";

const OPTIONS = { pixelRatio: 2, backgroundColor: "#fffdfa" };

// Safari でフォント未ロードのまま描画されるのを防ぐため fonts.ready を待つ
export async function captureCardPngBlob(el: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const blob = await toBlob(el, OPTIONS);
  if (!blob) throw new Error("PNG の生成に失敗しました");
  return blob;
}
