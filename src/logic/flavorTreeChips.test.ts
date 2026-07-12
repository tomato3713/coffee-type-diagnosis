import { describe, expect, it } from "vitest";
import { computeOffscreenChips, edgeExitPoint } from "./flavorTreeChips";
import type { LaidOutNode } from "./flavorTreeLayout";

const SIZE = { width: 200, height: 200 };
const PAD = 10;
const identity = (node: LaidOutNode) => ({ x: node.x, y: node.y });

function makeNode(overrides: Partial<LaidOutNode>): LaidOutNode {
  return {
    label: "ノード",
    color: "#000",
    x: 0,
    y: 0,
    angle: 0,
    radius: 0,
    depth: 0,
    isLeaf: false,
    highlighted: false,
    parentIndex: null,
    ...overrides,
  };
}

describe("edgeExitPoint", () => {
  it("右方向へ画面外に出る線分は右端（pad の内側）と交わる", () => {
    const at = edgeExitPoint({ x: 100, y: 100 }, { x: 500, y: 100 }, SIZE, PAD);
    expect(at).toEqual({ x: 190, y: 100 });
  });

  it("下方向へ画面外に出る線分は下端と交わる", () => {
    const at = edgeExitPoint({ x: 100, y: 100 }, { x: 100, y: 500 }, SIZE, PAD);
    expect(at).toEqual({ x: 100, y: 190 });
  });

  it("斜めの線分は先に到達する境界で止まり、交点は画面内に収まる", () => {
    const at = edgeExitPoint({ x: 100, y: 100 }, { x: 500, y: 300 }, SIZE, PAD);
    expect(at.x).toBe(190);
    expect(at.y).toBeCloseTo(145);
  });
});

describe("computeOffscreenChips", () => {
  const root = makeNode({ x: 100, y: 100 });

  it("サイズ未確定（width 0）の間は空になる", () => {
    const child = makeNode({ x: 500, y: 100, parentIndex: 0 });
    expect(
      computeOffscreenChips(
        [root, child],
        identity,
        { width: 0, height: 0 },
        PAD,
      ),
    ).toEqual([]);
  });

  it("画面内の親から画面外の分岐ノードへのエッジにチップが出る", () => {
    const child = makeNode({ label: "ベリー", x: 500, y: 100, parentIndex: 0 });
    const chips = computeOffscreenChips([root, child], identity, SIZE, PAD);
    expect(chips.length).toBe(1);
    // チップ全体（幅 3文字*11+20=53）が画面内に収まるよう x が寄せられる
    expect(chips[0].width).toBe(53);
    expect(chips[0].at).toEqual({ x: 200 - PAD - 53 / 2, y: 100 });
  });

  it("葉ノードと画面内のノードにはチップが出ない", () => {
    const leaf = makeNode({ x: 500, y: 100, parentIndex: 0, isLeaf: true });
    const visible = makeNode({ x: 150, y: 100, parentIndex: 0 });
    expect(
      computeOffscreenChips([root, leaf, visible], identity, SIZE, PAD),
    ).toEqual([]);
  });

  it("親も画面外ならチップは出ない", () => {
    const parent = makeNode({ x: -100, y: 100 });
    const child = makeNode({ x: -500, y: 100, parentIndex: 0 });
    expect(computeOffscreenChips([parent, child], identity, SIZE, PAD)).toEqual(
      [],
    );
  });

  it("画面端で重なったチップは下へずれて重ならない", () => {
    const childA = makeNode({
      label: "ベリー",
      x: 500,
      y: 100,
      parentIndex: 0,
    });
    const childB = makeNode({
      label: "柑橘系",
      x: 600,
      y: 100,
      parentIndex: 0,
    });
    const chips = computeOffscreenChips(
      [root, childA, childB],
      identity,
      SIZE,
      PAD,
    );
    expect(chips.length).toBe(2);
    expect(chips[0].at.y).toBe(100);
    expect(chips[1].at.y).toBe(126);
  });
});
