import { describe, expect, it } from "vitest";
import { FLAVOR_TREE, type FlavorTreeNode } from "../data/flavorTree";
import { FLAVOR_CATEGORIES } from "../data/results";
import type { FlavorCategoryId } from "../types";
import { layoutFlavorTree } from "./flavorTreeLayout";

function collectCategoryIds(
  node: FlavorTreeNode,
  into: Set<FlavorCategoryId>,
): void {
  for (const id of node.categoryIds ?? []) into.add(id);
  for (const child of node.children ?? []) collectCategoryIds(child, into);
}

describe("フレーバーツリーのデータ整合性", () => {
  it("診断結果の全フレーバー分類がツリー上のノードに対応している", () => {
    const tagged = new Set<FlavorCategoryId>();
    collectCategoryIds(FLAVOR_TREE, tagged);
    for (const category of FLAVOR_CATEGORIES) {
      expect(tagged).toContain(category.id);
    }
  });

  it("SCA ホイールの9大分類が第1階層に並ぶ", () => {
    expect(FLAVOR_TREE.children?.length).toBe(9);
    for (const category of FLAVOR_TREE.children ?? []) {
      expect(category.color).toBeDefined();
      expect(category.icon).toBeDefined();
    }
  });
});

describe("layoutFlavorTree", () => {
  it("全ノードが配置され、ルート以外は親を持つ", () => {
    const { nodes } = layoutFlavorTree(FLAVOR_TREE);
    expect(nodes.length).toBeGreaterThan(100);
    expect(nodes[0].parentIndex).toBeNull();
    for (const node of nodes.slice(1)) {
      expect(node.parentIndex).not.toBeNull();
    }
  });

  it("葉は重ならない Y 座標を持つ", () => {
    const { nodes } = layoutFlavorTree(FLAVOR_TREE);
    const ys = nodes.filter((n) => n.isLeaf).map((n) => n.y);
    expect(new Set(ys).size).toBe(ys.length);
  });

  it("強調なしでは hasHighlight が false になり、全ノード非強調になる", () => {
    const { nodes, hasHighlight } = layoutFlavorTree(FLAVOR_TREE);
    expect(hasHighlight).toBe(false);
    expect(nodes.every((n) => !n.highlighted)).toBe(true);
  });

  it("強調指定した分類は対応ノードの祖先と子孫が強調される", () => {
    const { nodes, hasHighlight } = layoutFlavorTree(FLAVOR_TREE, ["berry"]);
    expect(hasHighlight).toBe(true);
    const byLabel = new Map(nodes.map((n) => [n.label, n]));
    // 対応ノード自身と子孫
    expect(byLabel.get("ベリー")?.highlighted).toBe(true);
    expect(byLabel.get("ブルーベリー")?.highlighted).toBe(true);
    // 根までの経路
    expect(byLabel.get("果実 (Fruity)")?.highlighted).toBe(true);
    expect(byLabel.get("コーヒーフレーバー")?.highlighted).toBe(true);
    // 無関係な枝は強調されない
    expect(byLabel.get("柑橘系")?.highlighted).toBe(false);
    expect(byLabel.get("ナッツ・ココア (Nutty/Cocoa)")?.highlighted).toBe(
      false,
    );
  });

  it("色は最も近い祖先カテゴリから継承される", () => {
    const { nodes } = layoutFlavorTree(FLAVOR_TREE);
    const byLabel = new Map(nodes.map((n) => [n.label, n]));
    expect(byLabel.get("ブルーベリー")?.color).toBe(
      byLabel.get("果実 (Fruity)")?.color,
    );
    expect(byLabel.get("チョコレート")?.color).toBe(
      byLabel.get("ナッツ・ココア (Nutty/Cocoa)")?.color,
    );
  });
});
