import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FLAVOR_TREE } from "../data/flavorTree";
import { isTouchDevice } from "../logic/device";
import { computeOffscreenChips } from "../logic/flavorTreeChips";
import { type LaidOutNode, layoutFlavorTree } from "../logic/flavorTreeLayout";
import type { FlavorCategoryId } from "../types";
import { FlavorNodeDetailModal } from "./FlavorNodeDetailModal";
import { FlavorNodeTooltip } from "./FlavorNodeTooltip";
import { FlavorTreeNode } from "./FlavorTreeNode";
import { clampScale, useTreePanZoom } from "./useTreePanZoom";

interface Props {
  highlightIds?: FlavorCategoryId[];
}

const EDGE_PAD = 10;
const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 8;
const HOVER_DELAY_MS = 400;

// SCA フレーバーホイールの木を SVG で描画する。
// ドラッグでパン、ホイール / ピンチ / ボタンでズームできる。
// ノードをクリックするとそこへ拡大表示し、長押しで詳細説明を開く。
// 画面外に伸びるエッジには行き先ノードのラベルを出し、押すとそこへ移動する
export function FlavorTreeView({ highlightIds = [] }: Props) {
  const layout = useMemo(
    () => layoutFlavorTree(FLAVOR_TREE, highlightIds),
    [highlightIds],
  );
  // タッチ端末は長押しで、PC はホバーで詳細説明を出す
  const touchDevice = useMemo(() => isTouchDevice(), []);
  const panZoom = useTreePanZoom(layout);
  const { containerRef, size, view } = panZoom;
  // クリックで選択中のノード（中心に拡大表示し、強調リングを出す）
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // 長押しで詳細説明モーダルを開くノード（タッチデバイスのみ）
  const [describedNode, setDescribedNode] = useState<LaidOutNode | null>(null);
  // PC でホバーしたときに詳細説明を出すノード
  const [hover, setHover] = useState<{
    node: LaidOutNode;
    x: number;
    y: number;
  } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPress = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    pointerId: number | null;
    x: number;
    y: number;
    triggered: boolean;
  }>({ timer: null, pointerId: null, x: 0, y: 0, triggered: false });

  // 強調表示があるときは、強調された枝と、その隣り合うフレーバーが
  // 一緒に見える位置・倍率で開始する。強調なしなら全体が収まるようにする
  const focusInitial = useCallback(() => {
    if (size.width === 0) return;
    const highlighted = layout.nodes.filter((n) => n.highlighted);
    let minX = 0;
    let maxX = layout.width;
    let minY = 0;
    let maxY = layout.height;
    if (layout.hasHighlight && highlighted.length > 0) {
      // 隣のフレーバーと外側に伸びるラベルが入るぶんの余白
      const pad = 120;
      minX = Math.min(...highlighted.map((n) => n.x)) - pad;
      maxX = Math.max(...highlighted.map((n) => n.x)) + pad;
      minY = Math.min(...highlighted.map((n) => n.y)) - pad;
      maxY = Math.max(...highlighted.map((n) => n.y)) + pad;
    }
    const k = clampScale(
      Math.min(1.2, size.height / (maxY - minY), size.width / (maxX - minX)),
    );
    panZoom.setClampedView({
      k,
      x: size.width / 2 - ((minX + maxX) / 2) * k,
      y: size.height / 2 - ((minY + maxY) / 2) * k,
    });
  }, [layout, size, panZoom.setClampedView]);

  useEffect(() => {
    focusInitial();
    setSelectedIndex(null);
    setDescribedNode(null);
    setHover(null);
  }, [focusInitial]);

  // 長押し判定（タッチデバイスのみ）: pointerdown から一定時間、
  // 大きく動かず離されなければ発火する
  const clearLongPressTimer = useCallback(() => {
    if (longPress.current.timer) clearTimeout(longPress.current.timer);
    longPress.current.timer = null;
  }, []);

  const startLongPress = useCallback(
    (node: LaidOutNode, e: React.PointerEvent) => {
      if (!touchDevice) return;
      clearLongPressTimer();
      const timer = setTimeout(() => {
        longPress.current.triggered = true;
        setDescribedNode(node);
      }, LONG_PRESS_MS);
      longPress.current = {
        timer,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        triggered: false,
      };
    },
    [clearLongPressTimer, touchDevice],
  );

  // ホバー判定（PC のみ）: マウスがノード上に留まったら詳細説明を出す
  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);

  const startHover = useCallback(
    (node: LaidOutNode, x: number, y: number) => {
      if (touchDevice) return;
      clearHoverTimer();
      hoverTimer.current = setTimeout(
        () => setHover({ node, x, y }),
        HOVER_DELAY_MS,
      );
    },
    [clearHoverTimer, touchDevice],
  );

  const endHover = useCallback(() => {
    clearHoverTimer();
    setHover(null);
  }, [clearHoverTimer]);

  // アンマウント時にホバーの遅延タイマーが残らないようにする
  useEffect(() => () => clearHoverTimer(), [clearHoverTimer]);

  // パン・ズームのポインタ処理に、長押しのキャンセル判定を重ねる
  function onPointerMove(e: React.PointerEvent) {
    if (
      longPress.current.pointerId === e.pointerId &&
      Math.hypot(
        e.clientX - longPress.current.x,
        e.clientY - longPress.current.y,
      ) > LONG_PRESS_MOVE_TOLERANCE
    ) {
      clearLongPressTimer();
    }
    panZoom.onPointerMove(e);
  }

  function onPointerEnd(e: React.PointerEvent) {
    clearLongPressTimer();
    panZoom.onPointerEnd(e);
  }

  function selectNode(index: number, node: LaidOutNode) {
    if (longPress.current.triggered) {
      // 直前の長押しでモーダルを開いた分のクリックは無視する
      longPress.current.triggered = false;
      return;
    }
    setSelectedIndex(index);
    panZoom.focusOnNode(node);
  }

  const dimmed = (highlighted: boolean) => layout.hasHighlight && !highlighted;

  // 画面内のノードから画面外へ伸びるエッジ: 行き先のラベルを画面端に出す
  const offscreenChips = computeOffscreenChips(
    layout.nodes,
    (node) => ({ x: node.x * view.k + view.x, y: node.y * view.k + view.y }),
    size,
    EDGE_PAD,
  );

  return (
    <div className="flavor-tree">
      <div
        ref={containerRef}
        className="flavor-tree-canvas"
        onPointerDown={panZoom.onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <svg role="img" aria-label="SCA フレーバーホイールのツリー表示">
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            {layout.nodes.map((node) => {
              if (node.parentIndex === null) return null;
              const parent = layout.nodes[node.parentIndex];
              // 極座標での中間半径を制御点にした放射状の曲線。
              // 根は半径0で角度が意味を持たないため、中心からは直線で伸ばす
              const rm = (parent.radius + node.radius) / 2;
              const c1x = layout.center + rm * Math.cos(parent.angle);
              const c1y = layout.center + rm * Math.sin(parent.angle);
              const c2x = layout.center + rm * Math.cos(node.angle);
              const c2y = layout.center + rm * Math.sin(node.angle);
              const d =
                parent.radius === 0
                  ? `M ${parent.x} ${parent.y} L ${node.x} ${node.y}`
                  : `M ${parent.x} ${parent.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${node.x} ${node.y}`;
              return (
                <path
                  key={`link-${node.parentIndex}-${node.label}`}
                  d={d}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={node.highlighted ? 4 : 1.5}
                  opacity={dimmed(node.highlighted) ? 0.15 : 0.8}
                />
              );
            })}
            {layout.nodes.map((node, index) => (
              <FlavorTreeNode
                key={`node-${node.parentIndex}-${node.label}`}
                node={node}
                isSelected={index === selectedIndex}
                dimmed={dimmed(node.highlighted)}
                ariaLabel={
                  touchDevice
                    ? `${node.label} を中心に拡大表示（長押しで説明を表示）`
                    : `${node.label} を中心に拡大表示（ホバーで説明を表示）`
                }
                onSelect={() => selectNode(index, node)}
                onPointerDown={(e) => startLongPress(node, e)}
                onHoverStart={(x, y) => startHover(node, x, y)}
                onFocusShow={(x, y) => setHover({ node, x, y })}
                onHoverEnd={endHover}
              />
            ))}
          </g>
          {offscreenChips.map(({ node, width, at }) => (
            // biome-ignore lint/a11y/useSemanticElements: SVG 内のためボタン要素は使えない
            <g
              key={`chip-${node.parentIndex}-${node.label}`}
              className="flavor-tree-node"
              transform={`translate(${at.x},${at.y})`}
              opacity={dimmed(node.highlighted) ? 0.4 : 0.95}
              cursor="pointer"
              role="button"
              tabIndex={0}
              aria-label={`${node.label} へ移動`}
              onClick={() => panZoom.centerOn(node)}
              onKeyDown={(e) => e.key === "Enter" && panZoom.centerOn(node)}
            >
              <rect
                x={-width / 2}
                y={-11}
                width={width}
                height={22}
                rx={11}
                fill={node.color}
              />
              <text
                textAnchor="middle"
                y={4}
                fontSize={11}
                fontWeight={600}
                fill="#fff"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flavor-tree-controls">
        <button
          type="button"
          aria-label="拡大"
          onClick={() => panZoom.zoomAt(size.width / 2, size.height / 2, 1.4)}
        >
          ＋
        </button>
        <button
          type="button"
          aria-label="縮小"
          onClick={() =>
            panZoom.zoomAt(size.width / 2, size.height / 2, 1 / 1.4)
          }
        >
          −
        </button>
        <button type="button" onClick={focusInitial}>
          リセット
        </button>
      </div>
      <FlavorNodeDetailModal
        node={describedNode}
        onClose={() => setDescribedNode(null)}
      />
      {hover && <FlavorNodeTooltip node={hover.node} x={hover.x} y={hover.y} />}
    </div>
  );
}
