import { useCallback, useEffect, useRef, useState } from "react";
import type { Point, Size } from "../logic/flavorTreeChips";

export interface ViewTransform {
  x: number;
  y: number;
  k: number;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;
const DEFAULT_VIEW: ViewTransform = { x: 0, y: 0, k: 0.55 };
// この距離を超えて動いて初めてドラッグ（パン）とみなし、それまでは
// pointer capture を張らずクリックがノードにそのまま届くようにする
const DRAG_THRESHOLD = 4;
// ノードをクリックしたときに、そのノードを中心に据えつつ拡大する倍率
const ZOOM_IN_FACTOR = 1.8;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const clampScale = (k: number) => clamp(k, MIN_SCALE, MAX_SCALE);

interface PointerState {
  x: number;
  y: number;
  downX: number;
  downY: number;
  captured: boolean;
}

// フレーバーツリーのパン・ズーム（ドラッグ / ホイール / ピンチ / ボタン）を
// 管理するフック。containerRef を対象要素に張り、onPointer* をコンテナに
// 接続して使う
export function useTreePanZoom(layout: { width: number; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [view, setView] = useState<ViewTransform>(DEFAULT_VIEW);
  // ポインタ操作の作業領域（再レンダリング不要な値）
  const pointers = useRef(new Map<number, PointerState>());

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

  const setClampedView = useCallback(
    (v: ViewTransform) => setView(clampView(v)),
    [clampView],
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
    (node: Point) => {
      updateView((v) => ({
        k: v.k,
        x: size.width / 2 - node.x * v.k,
        y: size.height / 2 - node.y * v.k,
      }));
    },
    [updateView, size],
  );

  // ノードをクリックしたときに、そのノードを中心に据えつつ拡大する
  const focusOnNode = useCallback(
    (node: Point) => {
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
      const distance = (p1: Point, p2: Point) =>
        Math.hypot(p1.x - p2.x, p1.y - p2.y);
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
  }

  return {
    containerRef,
    size,
    view,
    setClampedView,
    zoomAt,
    centerOn,
    focusOnNode,
    onPointerDown,
    onPointerMove,
    onPointerEnd,
  };
}
