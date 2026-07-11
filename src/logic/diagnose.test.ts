import { describe, expect, it } from "vitest";
import { FLAVOR_QUESTIONS, QUESTIONS } from "../data/questions";
import {
  FLAVOR_CATEGORIES,
  RESULT_TYPES,
  SCA_WHEEL_CATEGORIES,
} from "../data/results";
import type { AxisId, FlavorBranch } from "../types";
import {
  diagnose,
  diagnoseFlavor,
  flavorBranch,
  scoreAxes,
  typeIdFromScores,
} from "./diagnose";

// 各質問で指定の符号（+1 / -1）側の選択肢 index を返す
function answersBySign(signs: Partial<Record<AxisId, 1 | -1>>): number[] {
  return QUESTIONS.map((q) =>
    q.choices.findIndex((c) => c.score.value === (signs[c.score.axis] ?? 1)),
  );
}

describe("diagnose", () => {
  it("全問プラス側を選ぶと acid-light-fruity-straight になる", () => {
    const answers = answersBySign({ taste: 1, body: 1, flavor: 1, style: 1 });
    expect(diagnose(answers).id).toBe("acid-light-fruity-straight");
  });

  it("全問マイナス側を選ぶと bitter-rich-nutty-milk になる", () => {
    const answers = answersBySign({
      taste: -1,
      body: -1,
      flavor: -1,
      style: -1,
    });
    expect(diagnose(answers).id).toBe("bitter-rich-nutty-milk");
  });

  it("回答の組み合わせで16タイプすべてに到達できる", () => {
    const reached = new Set<string>();
    for (const taste of [1, -1] as const) {
      for (const body of [1, -1] as const) {
        for (const flavor of [1, -1] as const) {
          for (const style of [1, -1] as const) {
            reached.add(
              diagnose(answersBySign({ taste, body, flavor, style })).id,
            );
          }
        }
      }
    }
    expect(reached).toEqual(new Set(Object.keys(RESULT_TYPES)));
  });

  it("軸スコアが 0 のときはマイナス側の極になる", () => {
    expect(typeIdFromScores({ taste: 0, body: 0, flavor: 0, style: 0 })).toBe(
      "bitter-rich-nutty-milk",
    );
  });

  it("範囲外の回答 index は例外を投げる", () => {
    const answers = answersBySign({});
    answers[0] = 9;
    expect(() => scoreAxes(answers)).toThrow(/invalid answer/);
  });
});

describe("flavorBranch", () => {
  it("flavor 軸がプラスなら fruity を返す", () => {
    expect(flavorBranch(answersBySign({ flavor: 1 }))).toBe("fruity");
  });

  it("flavor 軸がマイナスなら nutty を返す", () => {
    expect(flavorBranch(answersBySign({ flavor: -1 }))).toBe("nutty");
  });
});

describe("diagnoseFlavor", () => {
  it("2票の分類が1票の分類より先に返る", () => {
    // fruity: f1=berry, f2=tropical, f3=berry → berry 2票, tropical 1票
    expect(diagnoseFlavor("fruity", [0, 1, 1]).map((c) => c.id)).toEqual([
      "berry",
      "tropical",
    ]);
  });

  it("全分類が同数のときは定義順で上位2件が返る", () => {
    // fruity: f1=berry, f2=floral, f3=dried-fermented → 各1票
    expect(diagnoseFlavor("fruity", [0, 0, 0]).map((c) => c.id)).toEqual([
      "floral",
      "dried-fermented",
    ]);
  });

  it("返る分類は最大2件になる", () => {
    for (const branch of ["fruity", "nutty"] as const) {
      for (let bits = 0; bits < 8; bits++) {
        const answers = [bits & 1, (bits >> 1) & 1, (bits >> 2) & 1];
        const result = diagnoseFlavor(branch, answers);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.length).toBeLessThanOrEqual(2);
      }
    }
  });

  it("各分岐の深掘りで、その分岐の全分類に到達できる", () => {
    for (const branch of ["fruity", "nutty"] as const) {
      const votable = new Set(
        FLAVOR_QUESTIONS[branch].flatMap((q) =>
          q.choices.flatMap((c) => c.votes),
        ),
      );
      const reached = new Set<string>();
      for (let bits = 0; bits < 8; bits++) {
        const answers = [bits & 1, (bits >> 1) & 1, (bits >> 2) & 1];
        for (const c of diagnoseFlavor(branch, answers)) reached.add(c.id);
      }
      expect(reached).toEqual(votable);
    }
  });
});

describe("診断データの整合性", () => {
  it("基本質問が12問ある", () => {
    expect(QUESTIONS.length).toBe(12);
  });

  it("各軸の担当質問数は奇数になっている", () => {
    const counts = new Map<AxisId, number>();
    for (const q of QUESTIONS) {
      const axis = q.choices[0].score.axis;
      counts.set(axis, (counts.get(axis) ?? 0) + 1);
    }
    expect(counts.size).toBe(4);
    for (const count of counts.values()) expect(count % 2).toBe(1);
  });

  it("各質問の2択は同じ軸の +1 と -1 の組になっている", () => {
    for (const q of QUESTIONS) {
      expect(q.choices[0].score.axis).toBe(q.choices[1].score.axis);
      expect(q.choices[0].score.value + q.choices[1].score.value).toBe(0);
    }
  });

  it("結果タイプのキーは4軸の全組み合わせ16通りと一致する", () => {
    const expected = new Set<string>();
    for (const taste of ["bitter", "acid"]) {
      for (const body of ["rich", "light"]) {
        for (const flavor of ["nutty", "fruity"]) {
          for (const style of ["milk", "straight"]) {
            expected.add(`${taste}-${body}-${flavor}-${style}`);
          }
        }
      }
    }
    expect(new Set(Object.keys(RESULT_TYPES))).toEqual(expected);
    for (const [key, type] of Object.entries(RESULT_TYPES))
      expect(type.id).toBe(key);
  });

  it("フレーバー分類の大分類は SCA フレーバーホイールの分類リストに含まれる", () => {
    const wheel = new Set<string>(SCA_WHEEL_CATEGORIES);
    for (const category of FLAVOR_CATEGORIES) {
      expect(wheel).toContain(category.wheelCategory);
    }
  });

  it("深掘り質問の投票先はすべて定義済みのフレーバー分類になっている", () => {
    const ids = new Set(FLAVOR_CATEGORIES.map((c) => c.id));
    const branches: FlavorBranch[] = ["fruity", "nutty"];
    for (const branch of branches) {
      expect(FLAVOR_QUESTIONS[branch].length).toBe(3);
      for (const q of FLAVOR_QUESTIONS[branch]) {
        for (const c of q.choices) {
          expect(c.votes.length).toBeGreaterThan(0);
          for (const id of c.votes) expect(ids).toContain(id);
        }
      }
    }
  });
});
