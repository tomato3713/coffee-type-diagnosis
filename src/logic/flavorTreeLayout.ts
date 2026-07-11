import type { FlavorTreeNode } from "../data/flavorTree";
import type { FlavorCategoryId } from "../types";

export interface LaidOutNode {
  label: string;
  icon?: string;
  color: string;
  x: number;
  y: number;
  depth: number;
  isLeaf: boolean;
  highlighted: boolean;
  parentIndex: number | null;
}

export interface FlavorTreeLayout {
  nodes: LaidOutNode[];
  width: number;
  height: number;
  // 強調対象が1つでもあるか（false なら全体を通常表示）
  hasHighlight: boolean;
}

const COL_WIDTH = 230;
const ROW_HEIGHT = 26;
const PADDING = 24;

// 木を左→右のレイアウトに配置する。葉を上から等間隔に並べ、
// 内部ノードは子の中央に置く。highlightIds に対応するノードは
// その祖先と子孫ごと highlighted になる
export function layoutFlavorTree(
  root: FlavorTreeNode,
  highlightIds: FlavorCategoryId[] = [],
): FlavorTreeLayout {
  const highlightSet = new Set(highlightIds);
  const nodes: LaidOutNode[] = [];
  let leafCount = 0;
  let maxDepth = 0;

  function visit(
    node: FlavorTreeNode,
    depth: number,
    parentIndex: number | null,
    color: string,
    inheritedHighlight: boolean,
  ): { index: number; y: number; anyHighlight: boolean } {
    const ownColor = node.color ?? color;
    const tagged =
      inheritedHighlight ||
      (node.categoryIds?.some((id) => highlightSet.has(id)) ?? false);
    maxDepth = Math.max(maxDepth, depth);

    const index = nodes.length;
    const laidOut: LaidOutNode = {
      label: node.label,
      icon: node.icon,
      color: ownColor,
      x: PADDING + depth * COL_WIDTH,
      y: 0,
      depth,
      isLeaf: !node.children?.length,
      highlighted: tagged,
      parentIndex,
    };
    nodes.push(laidOut);

    let anyHighlight = tagged;
    if (node.children?.length) {
      const childYs: number[] = [];
      for (const child of node.children) {
        const result = visit(child, depth + 1, index, ownColor, tagged);
        childYs.push(result.y);
        anyHighlight ||= result.anyHighlight;
      }
      laidOut.y = (childYs[0] + childYs[childYs.length - 1]) / 2;
    } else {
      laidOut.y = PADDING + leafCount * ROW_HEIGHT;
      leafCount++;
    }
    // 子孫に強調対象がいれば、根までの経路も強調する
    laidOut.highlighted ||= anyHighlight;
    return { index, y: laidOut.y, anyHighlight };
  }

  visit(root, 0, null, root.color ?? "#6f4e37", false);

  return {
    nodes,
    width: PADDING * 2 + (maxDepth + 1) * COL_WIDTH,
    height: PADDING * 2 + leafCount * ROW_HEIGHT,
    hasHighlight: highlightSet.size > 0,
  };
}
