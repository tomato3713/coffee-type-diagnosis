import { toBlob } from "html-to-image";

const OPTIONS = { pixelRatio: 2, backgroundColor: "#fffdfa" };

// 結果カードを保存・共有用の PNG ファイルにする。
// Safari でフォント未ロードのまま描画されるのを防ぐため fonts.ready を待つ
export async function captureCardPngFile(
  el: HTMLElement,
  typeId: string,
): Promise<File> {
  await document.fonts.ready;
  const blob = await toBlob(el, OPTIONS);
  if (!blob) throw new Error("PNG の生成に失敗しました");
  return new File([blob], `coffee-type-${typeId}.png`, { type: "image/png" });
}
