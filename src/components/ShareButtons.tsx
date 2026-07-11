import type { RefObject } from "react";
import {
  buildShareText,
  buildShareUrl,
  lineShareUrl,
  mixiShareUrl,
  xIntentUrl,
} from "../logic/share";
import type { FlavorCategoryId, ResultType } from "../types";
import { captureCardPngBlob } from "./cardCapture";

interface Props {
  type: ResultType;
  flavorIds: FlavorCategoryId[];
  cardRef: RefObject<HTMLDivElement | null>;
}

export function ShareButtons({ type, flavorIds, cardRef }: Props) {
  const text = buildShareText(type.name);
  const shareUrl = buildShareUrl(
    `${location.origin}${import.meta.env.BASE_URL}`,
    {
      typeId: type.id,
      flavorIds,
    },
  );

  async function shareViaSheet() {
    try {
      const files = cardRef.current
        ? [
            new File(
              [await captureCardPngBlob(cardRef.current)],
              `coffee-type-${type.id}.png`,
              {
                type: "image/png",
              },
            ),
          ]
        : undefined;
      if (files && navigator.canShare?.({ files })) {
        await navigator.share({ files, text, url: shareUrl });
      } else {
        await navigator.share({ text, url: shareUrl });
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      // 画像生成や transient activation 切れで失敗したら text + url に縮退
      await navigator.share({ text, url: shareUrl }).catch(() => {});
    }
  }

  return (
    <div className="share-buttons">
      <a
        className="share-button"
        href={xIntentUrl(text, shareUrl)}
        target="_blank"
        rel="noopener noreferrer"
      >
        X でシェア
      </a>
      <a
        className="share-button"
        href={lineShareUrl(shareUrl)}
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
      {typeof navigator.share === "function" && (
        <button type="button" className="share-button" onClick={shareViaSheet}>
          その他のアプリで共有
        </button>
      )}
    </div>
  );
}
