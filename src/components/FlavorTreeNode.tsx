import type { LaidOutNode } from "../logic/flavorTreeLayout";

// ラベルがエッジと交差しても読めるよう、キャンバス背景色で縁取りする
const TEXT_HALO = {
  fill: "var(--color-ink)",
  stroke: "var(--color-surface)",
  strokeWidth: 3,
  strokeLinejoin: "round",
  paintOrder: "stroke",
} as const;

// "果実 (Fruity)" のような大分類ラベルを和名と英名に分ける
function splitLabel(label: string): [string, string] {
  const m = label.match(/^(.+?)\s+(\(.+\))$/);
  return m ? [m[1], m[2]] : [label, ""];
}

interface Props {
  node: LaidOutNode;
  isSelected: boolean;
  dimmed: boolean;
  ariaLabel: string;
  onSelect: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  // マウスが乗ったときの遅延表示（座標はツールチップの表示位置）
  onHoverStart: (x: number, y: number) => void;
  // キーボードフォーカス時の即時表示
  onFocusShow: (x: number, y: number) => void;
  onHoverEnd: () => void;
}

// フレーバーツリーのノード1個（当たり判定・選択リング・ラベル）
export function FlavorTreeNode({
  node,
  isSelected,
  dimmed,
  ariaLabel,
  onSelect,
  onPointerDown,
  onHoverStart,
  onFocusShow,
  onHoverEnd,
}: Props) {
  // ラベルは中心から外向きに回転させ、左半分では反転して読めるようにする
  const deg = (node.angle * 180) / Math.PI;
  const flipped = deg > 90 && deg < 270;
  const [jaLabel, enLabel] =
    node.depth === 1 ? splitLabel(node.label) : [node.label, ""];
  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG 内のためボタン要素は使えない
    <g
      className="flavor-tree-node"
      transform={`translate(${node.x},${node.y})`}
      opacity={dimmed ? 0.25 : 1}
      cursor="pointer"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      onMouseEnter={(e) => onHoverStart(e.clientX + 14, e.clientY + 14)}
      onMouseLeave={onHoverEnd}
      onFocus={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onFocusShow(rect.right + 8, rect.top);
      }}
      onBlur={onHoverEnd}
    >
      {/* タップしやすいよう見た目より広い透明な当たり判定 */}
      <circle r={14} fill="transparent" />
      {isSelected && (
        <circle
          r={(node.isLeaf ? 3.5 : 5.5) + 6}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2.5}
        />
      )}
      <circle r={node.isLeaf ? 3.5 : 5.5} fill={node.color} />
      {node.depth === 0 ? null : node.depth === 1 ? (
        // 大分類ラベルは長く、外向きに出すと子のエッジや中分類の
        // ラベルと重なるため、根のエッジしかない中心側に
        // 和名・英名の2行で表示する（エッジとは平行で重ならない）
        <g transform={`rotate(${flipped ? deg - 180 : deg})`}>
          <text
            x={flipped ? 10 : -10}
            y={-17}
            textAnchor={flipped ? "start" : "end"}
            fontSize={14}
            fontWeight={700}
            {...TEXT_HALO}
          >
            {node.icon ? `${node.icon} ` : ""}
            {jaLabel}
          </text>
          {enLabel && (
            <text
              x={flipped ? 10 : -10}
              y={-4}
              textAnchor={flipped ? "start" : "end"}
              fontSize={10}
              fontWeight={600}
              {...TEXT_HALO}
            >
              {enLabel}
            </text>
          )}
        </g>
      ) : (
        <text
          transform={`rotate(${flipped ? deg - 180 : deg})`}
          x={flipped ? -10 : 10}
          y={node.isLeaf ? 4 : -7}
          textAnchor={flipped ? "end" : "start"}
          fontSize={12}
          fontWeight={node.highlighted || isSelected ? 700 : 400}
          {...TEXT_HALO}
        >
          {node.icon ? `${node.icon} ` : ""}
          {node.label}
        </text>
      )}
    </g>
  );
}
