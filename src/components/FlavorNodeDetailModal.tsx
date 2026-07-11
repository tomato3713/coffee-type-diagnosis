import { useEffect, useRef } from "react";
import type { LaidOutNode } from "../logic/flavorTreeLayout";

interface Props {
  node: LaidOutNode | null;
  onClose: () => void;
}

// フレーバーツリーのノードを長押ししたときに開く詳細説明モーダル。
// ネイティブ <dialog> を使うことで、Escape での閉じる操作やフォーカス
// トラップをブラウザ標準機能に任せる
export function FlavorNodeDetailModal({ node, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (node && !dialog.open) dialog.showModal();
    if (!node && dialog.open) dialog.close();
  }, [node]);

  // ::backdrop（枠の外側）をクリックしたときだけ閉じる
  function onBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inside) onClose();
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 背景クリックはマウス操作の補助。キーボードでは Escape（dialog 標準機能）で閉じられる
    <dialog
      ref={dialogRef}
      className="flavor-modal"
      aria-label={node ? `${node.label}の詳細説明` : undefined}
      onClose={onClose}
      onClick={onBackdropClick}
    >
      {node && (
        <>
          <button
            type="button"
            className="flavor-modal-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
          <p className="flavor-modal-heading" style={{ color: node.color }}>
            {node.icon} {node.label}
          </p>
          <p className="flavor-modal-description">
            {node.description ??
              `SCA フレーバーホイール上の「${node.label}」です。`}
          </p>
        </>
      )}
    </dialog>
  );
}
