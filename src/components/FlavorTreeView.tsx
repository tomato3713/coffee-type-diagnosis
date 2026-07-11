import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FLAVOR_TREE } from "../data/flavorTree";
import { layoutFlavorTree } from "../logic/flavorTreeLayout";
import type { FlavorCategoryId } from "../types";

interface Props {
  highlightIds?: FlavorCategoryId[];
}

interface ViewTransform {
  x: number;
  y: number;
  k: number;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

function clampScale(k: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, k));
}

// SCA フレーバーホイールの木を SVG で描画する。
// ドラッグでパン、ホイール / ピンチ / ボタンでズームできる
export function FlavorTreeView({ highlightIds = [] }: Props) {
  const layout = useMemo(
    () => layoutFlavorTree(FLAVOR_TREE, highlightIds),
    [highlightIds],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewTransform>({ x: 0, y: 0, k: 0.55 });
  // ポインタ操作の作業領域（再レンダリング不要な値）
  const pointers = useRef(new Map<number, { x: number; y: number }>());

  // 指定した画面座標を不動点としてスケールを変える
  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    setView((v) => {
      const k = clampScale(v.k * factor);
      const scale = k / v.k;
      return { k, x: px - (px - v.x) * scale, y: py - (py - v.y) * scale };
    });
  }, []);

  function zoomAtCenter(factor: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) zoomAt(rect.width / 2, rect.height / 2, factor);
  }

  // 強調表示があるときは、強調された枝が収まる位置・倍率で開始する
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !layout.hasHighlight) return;
    const highlighted = layout.nodes.filter((n) => n.highlighted);
    if (highlighted.length === 0) return;
    const xs = highlighted.map((n) => n.x);
    const ys = highlighted.map((n) => n.y);
    const rect = el.getBoundingClientRect();
    const k = clampScale(
      Math.min(1, rect.height / (Math.max(...ys) - Math.min(...ys) + 160)),
    );
    setView({
      k,
      // ラベルが右に伸びるぶん少し左寄りに置く
      x: rect.width / 2 - ((Math.min(...xs) + Math.max(...xs)) / 2 + 80) * k,
      y: rect.height / 2 - ((Math.min(...ys) + Math.max(...ys)) / 2) * k,
    });
  }, [layout]);

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

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const current = { x: e.clientX, y: e.clientY };

    if (pointers.current.size === 1) {
      setView((v) => ({
        ...v,
        x: v.x + current.x - prev.x,
        y: v.y + current.y - prev.y,
      }));
    } else if (pointers.current.size === 2) {
      // ピンチ: 2本指の距離の変化率でズームし、中点を不動点にする
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
    }
    pointers.current.set(e.pointerId, current);
  }

  function onPointerEnd(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
  }

  const dimmed = (highlighted: boolean) => layout.hasHighlight && !highlighted;

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
              const midX = (parent.x + node.x) / 2;
              return (
                <path
                  key={`link-${node.parentIndex}-${node.label}`}
                  d={`M ${parent.x} ${parent.y} C ${midX} ${parent.y}, ${midX} ${node.y}, ${node.x} ${node.y}`}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={node.highlighted ? 4 : 1.5}
                  opacity={dimmed(node.highlighted) ? 0.15 : 0.8}
                />
              );
            })}
            {layout.nodes.map((node) => (
              <g
                key={`node-${node.parentIndex}-${node.label}`}
                transform={`translate(${node.x},${node.y})`}
                opacity={dimmed(node.highlighted) ? 0.25 : 1}
              >
                <circle r={node.isLeaf ? 3.5 : 5.5} fill={node.color} />
                <text
                  x={node.isLeaf ? 9 : 10}
                  y={node.isLeaf ? 4 : -8}
                  fontSize={node.depth <= 1 ? 15 : 12}
                  fontWeight={node.depth <= 1 || node.highlighted ? 700 : 400}
                  fill="var(--color-ink)"
                >
                  {node.icon ? `${node.icon} ` : ""}
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <div className="flavor-tree-controls">
        <button
          type="button"
          aria-label="拡大"
          onClick={() => zoomAtCenter(1.4)}
        >
          ＋
        </button>
        <button
          type="button"
          aria-label="縮小"
          onClick={() => zoomAtCenter(1 / 1.4)}
        >
          −
        </button>
        <button type="button" onClick={() => setView({ x: 0, y: 0, k: 0.55 })}>
          リセット
        </button>
      </div>
    </div>
  );
}
