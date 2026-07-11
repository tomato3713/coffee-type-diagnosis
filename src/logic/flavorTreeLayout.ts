import type { FlavorTreeNode } from "../data/flavorTree";
import type { FlavorCategoryId } from "../types";

export interface LaidOutNode {
  label: string;
  icon?: string;
  color: string;
  description?: string;
  x: number;
  y: number;
  // 中心からの角度（ラジアン、x軸正方向が0）と距離。ラベルの回転に使う
  angle: number;
  radius: number;
  depth: number;
  isLeaf: boolean;
  highlighted: boolean;
  parentIndex: number | null;
}

export interface FlavorTreeLayout {
  nodes: LaidOutNode[];
  width: number;
  height: number;
  center: number;
  // 強調対象が1つでもあるか（false なら全体を通常表示）
  hasHighlight: boolean;
}

// 階層1つぶんの半径と、最外周のラベル用の余白
export const LEVEL_RADIUS = 130;
export const LABEL_SPACE = 170;

function countLeaves(node: FlavorTreeNode): number {
  if (!node.children?.length) return 1;
  return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

// 木を根を中心とした放射状（360度）に配置する。葉を円周上に等間隔で並べ、
// 内部ノードは子の角度の中央に置く。highlightIds に対応するノードは
// その祖先と子孫ごと highlighted になる
export function layoutFlavorTree(
  root: FlavorTreeNode,
  highlightIds: FlavorCategoryId[] = [],
): FlavorTreeLayout {
  const highlightSet = new Set(highlightIds);
  const totalLeaves = countLeaves(root);
  const nodes: LaidOutNode[] = [];
  let leafIndex = 0;
  let maxDepth = 0;

  function visit(
    node: FlavorTreeNode,
    depth: number,
    parentIndex: number | null,
    color: string,
    inheritedHighlight: boolean,
  ): { angle: number; anyHighlight: boolean } {
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
      description: node.description,
      x: 0,
      y: 0,
      angle: 0,
      radius: depth * LEVEL_RADIUS,
      depth,
      isLeaf: !node.children?.length,
      highlighted: tagged,
      parentIndex,
    };
    nodes.push(laidOut);

    let anyHighlight = tagged;
    if (node.children?.length) {
      const childAngles: number[] = [];
      for (const child of node.children) {
        const result = visit(child, depth + 1, index, ownColor, tagged);
        childAngles.push(result.angle);
        anyHighlight ||= result.anyHighlight;
      }
      laidOut.angle =
        (childAngles[0] + childAngles[childAngles.length - 1]) / 2;
    } else {
      laidOut.angle = (leafIndex / totalLeaves) * 2 * Math.PI;
      leafIndex++;
    }
    // 子孫に強調対象がいれば、根までの経路も強調する
    laidOut.highlighted ||= anyHighlight;
    return { angle: laidOut.angle, anyHighlight };
  }

  visit(root, 0, null, root.color ?? "#6f4e37", false);

  const center = maxDepth * LEVEL_RADIUS + LABEL_SPACE;
  for (const node of nodes) {
    node.x = center + node.radius * Math.cos(node.angle);
    node.y = center + node.radius * Math.sin(node.angle);
  }

  return {
    nodes,
    width: center * 2,
    height: center * 2,
    center,
    hasHighlight: highlightSet.size > 0,
  };
}
