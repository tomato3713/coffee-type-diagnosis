import type { LaidOutNode } from "../logic/flavorTreeLayout";

interface Props {
  node: LaidOutNode;
  x: number;
  y: number;
}

// PC でノードにカーソルを止めたときに出す詳細説明のツールチップ
export function FlavorNodeTooltip({ node, x, y }: Props) {
  return (
    <div className="flavor-tooltip" style={{ left: x, top: y }}>
      <p className="flavor-tooltip-heading" style={{ color: node.color }}>
        {node.icon} {node.label}
      </p>
      <p className="flavor-tooltip-description">
        {node.description ??
          `SCA フレーバーホイール上の「${node.label}」です。`}
      </p>
    </div>
  );
}
