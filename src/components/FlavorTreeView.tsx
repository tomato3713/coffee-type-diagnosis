import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FLAVOR_TREE } from "../data/flavorTree";
import { isTouchDevice } from "../logic/device";
import { type LaidOutNode, layoutFlavorTree } from "../logic/flavorTreeLayout";
import type { FlavorCategoryId } from "../types";
import { FlavorNodeDetailModal } from "./FlavorNodeDetailModal";
import { FlavorNodeTooltip } from "./FlavorNodeTooltip";

interface Props {
  highlightIds?: FlavorCategoryId[];
}

interface ViewTransform {
  x: number;
  y: number;
  k: number;
}

interface Size {
  width: number;
  height: number;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;
const DEFAULT_VIEW: ViewTransform = { x: 0, y: 0, k: 0.55 };
const EDGE_PAD = 10;
const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 8;
const HOVER_DELAY_MS = 400;
// この距離を超えて動いて初めてドラッグ（パン）とみなし、それまでは
// pointer capture を張らずクリックがノードにそのまま届くようにする
const DRAG_THRESHOLD = 4;

interface PointerState {
  x: number;
  y: number;
  downX: number;
  downY: number;
  captured: boolean;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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

const clampScale = (k: number) => clamp(k, MIN_SCALE, MAX_SCALE);

// 画面内の from から画面外の to へ伸びる線分が、画面境界（pad の内側）と
// 交わる点を返す
function edgeExitPoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  size: Size,
  pad: number,
): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let t = 1;
  for (const bx of [pad, size.width - pad]) {
    if (dx !== 0) {
      const tt = (bx - from.x) / dx;
      if (tt > 0 && tt < t) t = tt;
    }
  }
  for (const by of [pad, size.height - pad]) {
    if (dy !== 0) {
      const tt = (by - from.y) / dy;
      if (tt > 0 && tt < t) t = tt;
    }
  }
  return {
    x: clamp(from.x + dx * t, pad, size.width - pad),
    y: clamp(from.y + dy * t, pad, size.height - pad),
  };
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [view, setView] = useState<ViewTransform>(DEFAULT_VIEW);
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
  // ポインタ操作の作業領域（再レンダリング不要な値）
  const pointers = useRef(new Map<number, PointerState>());
  const longPress = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    pointerId: number | null;
    x: number;
    y: number;
    triggered: boolean;
  }>({ timer: null, pointerId: null, x: 0, y: 0, triggered: false });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setSize({ width: el.clientWidth, height: el.clientHeight }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // どこまでパン・ズームしても、木の端の1〜2ノードぶんは画面内に残す
  const clampView = useCallback(
    (v: ViewTransform): ViewTransform => {
      if (size.width === 0) return v;
      const margin = Math.max(64, 52 * v.k);
      return {
        k: v.k,
        x: clamp(v.x, margin - layout.width * v.k, size.width - margin),
        y: clamp(v.y, margin - layout.height * v.k, size.height - margin),
      };
    },
    [layout, size],
  );

  const updateView = useCallback(
    (updater: (v: ViewTransform) => ViewTransform) => {
      setView((v) => clampView(updater(v)));
    },
    [clampView],
  );

  // 指定した画面座標を不動点としてスケールを変える
  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      updateView((v) => {
        const k = clampScale(v.k * factor);
        const scale = k / v.k;
        return { k, x: px - (px - v.x) * scale, y: py - (py - v.y) * scale };
      });
    },
    [updateView],
  );

  const centerOn = useCallback(
    (node: LaidOutNode) => {
      updateView((v) => ({
        k: v.k,
        x: size.width / 2 - node.x * v.k,
        y: size.height / 2 - node.y * v.k,
      }));
    },
    [updateView, size],
  );

  // ノードをクリックしたときに、そのノードを中心に据えつつ拡大する
  const ZOOM_IN_FACTOR = 1.8;
  const focusOnNode = useCallback(
    (node: LaidOutNode) => {
      updateView((v) => {
        const k = clampScale(v.k * ZOOM_IN_FACTOR);
        return {
          k,
          x: size.width / 2 - node.x * k,
          y: size.height / 2 - node.y * k,
        };
      });
    },
    [updateView, size],
  );

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
    setView(
      clampView({
        k,
        x: size.width / 2 - ((minX + maxX) / 2) * k,
        y: size.height / 2 - ((minY + maxY) / 2) * k,
      }),
    );
  }, [layout, size, clampView]);

  useEffect(() => {
    focusInitial();
    setSelectedIndex(null);
    setDescribedNode(null);
    setHover(null);
  }, [focusInitial]);

  // React の onWheel は passive なため、preventDefault できるよう直接登録する
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        e.clientX - rect.left,
        e.clientY - rect.top,
        Math.exp(-e.deltaY * 0.002),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

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

  function onPointerDown(e: React.PointerEvent) {
    // ここでは pointer capture を張らない。単純なクリックまで巻き込むと、
    // pointerup / click の対象がこのコンテナに奪われてノードに届かなくなる
    pointers.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      downX: e.clientX,
      downY: e.clientY,
      captured: false,
    });
  }

  // ブラウザによっては無効な pointerId で例外を投げることがあるため、
  // capture できなくてもドラッグ判定自体は続行する
  function tryCapture(e: React.PointerEvent) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const current = { x: e.clientX, y: e.clientY };

    if (
      longPress.current.pointerId === e.pointerId &&
      Math.hypot(
        current.x - longPress.current.x,
        current.y - longPress.current.y,
      ) > LONG_PRESS_MOVE_TOLERANCE
    ) {
      clearLongPressTimer();
    }

    if (pointers.current.size >= 2) {
      // ピンチ: 2本指なので通常のクリックとは衝突しない
      if (!prev.captured) {
        tryCapture(e);
        prev.captured = true;
      }
      // 2本指の距離の変化率でズームし、中点を不動点にする
      const [a, b] = [...pointers.current.entries()].map(([id, p]) =>
        id === e.pointerId ? { id, p: current, prev: p } : { id, p, prev: p },
      );
      const distance = (
        p1: { x: number; y: number },
        p2: { x: number; y: number },
      ) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const factor = distance(a.p, b.p) / distance(a.prev, b.prev);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && Number.isFinite(factor) && factor > 0) {
        zoomAt(
          (a.p.x + b.p.x) / 2 - rect.left,
          (a.p.y + b.p.y) / 2 - rect.top,
          factor,
        );
      }
    } else if (
      prev.captured ||
      Math.hypot(current.x - prev.downX, current.y - prev.downY) >
        DRAG_THRESHOLD
    ) {
      // 閾値を超えて初めてドラッグ（パン）とみなし、この時点で capture する
      if (!prev.captured) {
        tryCapture(e);
        prev.captured = true;
      }
      updateView((v) => ({
        ...v,
        x: v.x + current.x - prev.x,
        y: v.y + current.y - prev.y,
      }));
    }
    pointers.current.set(e.pointerId, { ...prev, x: current.x, y: current.y });
  }

  function onPointerEnd(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    clearLongPressTimer();
  }

  function selectNode(index: number, node: LaidOutNode) {
    if (longPress.current.triggered) {
      // 直前の長押しでモーダルを開いた分のクリックは無視する
      longPress.current.triggered = false;
      return;
    }
    setSelectedIndex(index);
    focusOnNode(node);
  }

  const dimmed = (highlighted: boolean) => layout.hasHighlight && !highlighted;

  const toScreen = (node: LaidOutNode) => ({
    x: node.x * view.k + view.x,
    y: node.y * view.k + view.y,
  });
  const onScreen = (p: { x: number; y: number }) =>
    p.x >= 0 && p.x <= size.width && p.y >= 0 && p.y <= size.height;

  // 画面内のノードから画面外へ伸びるエッジ: 行き先のラベルを画面端に出す。
  // 葉まで出すと画面が埋まるため、分岐ノード（大分類・中分類）に限る
  const offscreenChips =
    size.width === 0
      ? []
      : layout.nodes.flatMap((node) => {
          if (node.parentIndex === null || node.isLeaf) return [];
          const parentPos = toScreen(layout.nodes[node.parentIndex]);
          const nodePos = toScreen(node);
          if (!onScreen(parentPos) || onScreen(nodePos)) return [];
          const width = node.label.length * 11 + 20;
          const at = edgeExitPoint(parentPos, nodePos, size, EDGE_PAD);
          return [
            {
              node,
              width,
              at: {
                // チップ全体が画面内に収まるよう中心座標を寄せる
                x: clamp(
                  at.x,
                  EDGE_PAD + width / 2,
                  size.width - EDGE_PAD - width / 2,
                ),
                y: clamp(at.y, EDGE_PAD + 11, size.height - EDGE_PAD - 11),
              },
            },
          ];
        });

  // 画面端で重なったチップは下に少しずつずらす
  for (const [i, chip] of offscreenChips.entries()) {
    while (
      offscreenChips
        .slice(0, i)
        .some(
          (other) =>
            Math.abs(other.at.x - chip.at.x) < (other.width + chip.width) / 2 &&
            Math.abs(other.at.y - chip.at.y) < 24,
        )
    ) {
      chip.at.y += 26;
    }
  }

  return (
    <div className="flavor-tree">
      <div
        ref={containerRef}
        className="flavor-tree-canvas"
        onPointerDown={onPointerDown}
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
            {layout.nodes.map((node, index) => {
              // ラベルは中心から外向きに回転させ、左半分では反転して読めるようにする
              const deg = (node.angle * 180) / Math.PI;
              const flipped = deg > 90 && deg < 270;
              const isSelected = index === selectedIndex;
              return (
                // biome-ignore lint/a11y/useSemanticElements: SVG 内のためボタン要素は使えない
                <g
                  key={`node-${node.parentIndex}-${node.label}`}
                  className="flavor-tree-node"
                  transform={`translate(${node.x},${node.y})`}
                  opacity={dimmed(node.highlighted) ? 0.25 : 1}
                  cursor="pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={
                    touchDevice
                      ? `${node.label} を中心に拡大表示（長押しで説明を表示）`
                      : `${node.label} を中心に拡大表示（ホバーで説明を表示）`
                  }
                  onPointerDown={(e) => startLongPress(node, e)}
                  onClick={() => selectNode(index, node)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && selectNode(index, node)
                  }
                  onMouseEnter={(e) =>
                    startHover(node, e.clientX + 14, e.clientY + 14)
                  }
                  onMouseLeave={endHover}
                  onFocus={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHover({ node, x: rect.right + 8, y: rect.top });
                  }}
                  onBlur={endHover}
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
                        {splitLabel(node.label)[0]}
                      </text>
                      {splitLabel(node.label)[1] && (
                        <text
                          x={flipped ? 10 : -10}
                          y={-4}
                          textAnchor={flipped ? "start" : "end"}
                          fontSize={10}
                          fontWeight={600}
                          {...TEXT_HALO}
                        >
                          {splitLabel(node.label)[1]}
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
            })}
          </g>
          {offscreenChips.map(({ node, at }) => {
            const width = node.label.length * 11 + 20;
            // チップ全体が画面内に収まるよう中心座標を寄せる
            at = {
              x: clamp(
                at.x,
                EDGE_PAD + width / 2,
                size.width - EDGE_PAD - width / 2,
              ),
              y: clamp(at.y, EDGE_PAD + 11, size.height - EDGE_PAD - 11),
            };
            return (
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
                onClick={() => centerOn(node)}
                onKeyDown={(e) => e.key === "Enter" && centerOn(node)}
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
            );
          })}
        </svg>
      </div>
      <div className="flavor-tree-controls">
        <button
          type="button"
          aria-label="拡大"
          onClick={() => zoomAt(size.width / 2, size.height / 2, 1.4)}
        >
          ＋
        </button>
        <button
          type="button"
          aria-label="縮小"
          onClick={() => zoomAt(size.width / 2, size.height / 2, 1 / 1.4)}
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
