import type { LaidOutNode } from "./flavorTreeLayout";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface OffscreenChip {
  node: LaidOutNode;
  width: number;
  at: Point;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// 画面内の from から画面外の to へ伸びる線分が、画面境界（pad の内側）と
// 交わる点を返す
export function edgeExitPoint(
  from: Point,
  to: Point,
  size: Size,
  pad: number,
): Point {
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

// 画面内のノードから画面外へ伸びるエッジについて、行き先ノードのラベルを
// チップとして画面端に置く位置を求める。葉まで出すと画面が埋まるため、
// 分岐ノード（大分類・中分類）に限る。画面端で重なったチップは下へずらす
export function computeOffscreenChips(
  nodes: LaidOutNode[],
  toScreen: (node: LaidOutNode) => Point,
  size: Size,
  pad: number,
): OffscreenChip[] {
  if (size.width === 0) return [];
  const onScreen = (p: Point) =>
    p.x >= 0 && p.x <= size.width && p.y >= 0 && p.y <= size.height;

  const chips = nodes.flatMap((node) => {
    if (node.parentIndex === null || node.isLeaf) return [];
    const parentPos = toScreen(nodes[node.parentIndex]);
    const nodePos = toScreen(node);
    if (!onScreen(parentPos) || onScreen(nodePos)) return [];
    const width = node.label.length * 11 + 20;
    const at = edgeExitPoint(parentPos, nodePos, size, pad);
    return [
      {
        node,
        width,
        // チップ全体が画面内に収まるよう中心座標を寄せる
        at: {
          x: clamp(at.x, pad + width / 2, size.width - pad - width / 2),
          y: clamp(at.y, pad + 11, size.height - pad - 11),
        },
      },
    ];
  });

  for (const [i, chip] of chips.entries()) {
    while (
      chips
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
  return chips;
}
