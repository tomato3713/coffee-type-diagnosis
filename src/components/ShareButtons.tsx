import type { RefObject } from "react";
import { isTouchDevice } from "../logic/device";
import {
  buildShareText,
  buildShareUrl,
  lineShareUrl,
  mixiShareUrl,
  xIntentUrl,
} from "../logic/share";
import type { FlavorCategoryId, ResultType } from "../types";
import { captureCardPngFile } from "./cardCapture";

interface Props {
  type: ResultType;
  flavorIds: FlavorCategoryId[];
  cardRef: RefObject<HTMLDivElement | null>;
}

export function ShareButtons({ type, flavorIds, cardRef }: Props) {
  const shareUrl = buildShareUrl(
    `${location.origin}${import.meta.env.BASE_URL}`,
    {
      typeId: type.id,
      roast: type.roast,
      process: type.process,
      flavorIds,
    },
  );
  const text = buildShareText(type.name, shareUrl);

  // スマホ等のタッチデバイスは OS の共有シートに一本化し、
  // PC では X / LINE / mixi の intent リンクを並べる
  const useShareSheet =
    isTouchDevice() && typeof navigator.share === "function";

  async function shareViaSheet() {
    // text に url を含めているため、別途 url を渡すと二重に表示される
    try {
      const files = cardRef.current
        ? [
            await captureCardPngFile(
              cardRef.current,
              `coffee-type-${type.id}.png`,
            ),
          ]
        : undefined;
      if (files && navigator.canShare?.({ files })) {
        await navigator.share({ files, text });
      } else {
        await navigator.share({ text });
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      // 画像生成や transient activation 切れで失敗したら text のみに縮退
      await navigator.share({ text }).catch(() => {});
    }
  }

  if (useShareSheet) {
    return (
      <div className="share-buttons">
        <button type="button" className="share-button" onClick={shareViaSheet}>
          シェアする
        </button>
      </div>
    );
  }

  return (
    <div className="share-buttons">
      <a
        className="share-button"
        href={xIntentUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
      >
        X でシェア
      </a>
      <a
        className="share-button"
        href={lineShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
      >
        LINE でシェア
      </a>
      <a
        className="share-button"
        href={mixiShareUrl(shareUrl)}
        target="_blank"
        rel="noopener noreferrer"
      >
        mixi でシェア
      </a>
    </div>
  );
}
