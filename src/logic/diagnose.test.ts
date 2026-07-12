import { describe, expect, it } from "vitest";
import {
  FLAVOR_QUESTIONS,
  PROCESS_BY_ANSWERS,
  PROCESS_QUESTIONS,
  QUESTIONS,
  ROAST_QUESTIONS,
} from "../data/questions";
import {
  FLAVOR_CATEGORIES,
  PROCESS_METHODS,
  RESULT_TYPES,
  ROAST_LEVELS,
  SCA_WHEEL_CATEGORIES,
} from "../data/results";
import type { AxisId, FlavorBranch } from "../types";
import {
  diagnose,
  diagnoseFlavor,
  diagnoseProcess,
  diagnoseRoast,
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

// bits の下位 length ビットを 0/1 の回答配列に変換する
function bitsToAnswers(bits: number, length: number): number[] {
  return Array.from({ length }, (_, i) => (bits >> i) & 1);
}

describe("diagnoseFlavor", () => {
  it("2票の分類が1票の分類より先に返る", () => {
    // fruity: f1=floral, f5=floral で floral が2票、f2/f3/f4 は各1票
    expect(diagnoseFlavor("fruity", [0, 0, 0, 0, 0]).map((c) => c.id)).toEqual([
      "floral",
      "berry",
      "dried-fruit",
      "sour",
    ]);
  });

  it("全分類が同数のときは定義順ですべて返る", () => {
    // fruity: f1=black-tea, f2=citrus, f3=dried-fruit, f4=sour, f5=floral
    // → 重複なく5分類がすべて1票ずつ
    expect(diagnoseFlavor("fruity", [1, 1, 0, 0, 0]).map((c) => c.id)).toEqual([
      "floral",
      "black-tea",
      "dried-fruit",
      "citrus",
      "sour",
    ]);
  });

  it("返る件数は質問数を超えない（取りこぼさない）", () => {
    for (const branch of ["fruity", "nutty"] as const) {
      const questionCount = FLAVOR_QUESTIONS[branch].length;
      for (let bits = 0; bits < 2 ** questionCount; bits++) {
        const result = diagnoseFlavor(
          branch,
          bitsToAnswers(bits, questionCount),
        );
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.length).toBeLessThanOrEqual(questionCount);
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
      const questionCount = FLAVOR_QUESTIONS[branch].length;
      const reached = new Set<string>();
      for (let bits = 0; bits < 2 ** questionCount; bits++) {
        for (const c of diagnoseFlavor(
          branch,
          bitsToAnswers(bits, questionCount),
        )) {
          reached.add(c.id);
        }
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

  it("焙煎度マスタは浅い順の8段階になっている", () => {
    expect(ROAST_LEVELS.map((r) => r.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("焙煎度質問の重みは2進の桁（4/2/1）と浅煎り側の0で構成される", () => {
    const weights = ROAST_QUESTIONS.map((q) =>
      [...q.choices.map((c) => c.weight)].sort((a, b) => a - b),
    );
    expect(weights).toEqual([
      [0, 4],
      [0, 2],
      [0, 1],
    ]);
  });

  it("精製方法の対応表は回答の全組み合わせ分あり、7種すべてを網羅する", () => {
    expect(PROCESS_BY_ANSWERS.length).toBe(2 ** PROCESS_QUESTIONS.length);
    expect(new Set(PROCESS_BY_ANSWERS)).toEqual(
      new Set(Object.keys(PROCESS_METHODS)),
    );
  });

  it("フレーバー分類の大分類は SCA フレーバーホイールの分類リストに含まれる", () => {
    const wheel = new Set<string>(SCA_WHEEL_CATEGORIES);
    for (const category of FLAVOR_CATEGORIES) {
      expect(wheel).toContain(category.wheelCategory);
    }
  });

  it("深掘り質問の投票先はすべて定義済みのフレーバー分類になっている", () => {
    const ids = new Set(FLAVOR_CATEGORIES.map((c) => c.id));
    const expectedQuestionCounts: Record<FlavorBranch, number> = {
      fruity: 5,
      nutty: 6,
    };
    const branches: FlavorBranch[] = ["fruity", "nutty"];
    for (const branch of branches) {
      expect(FLAVOR_QUESTIONS[branch].length).toBe(
        expectedQuestionCounts[branch],
      );
      for (const q of FLAVOR_QUESTIONS[branch]) {
        for (const c of q.choices) {
          expect(c.votes.length).toBeGreaterThan(0);
          for (const id of c.votes) expect(ids).toContain(id);
        }
      }
    }
  });
});

describe("diagnoseRoast", () => {
  it("回答の全組み合わせで1〜8の全段階に到達できる", () => {
    const reached = new Set<number>();
    for (let bits = 0; bits < 2 ** ROAST_QUESTIONS.length; bits++) {
      reached.add(diagnoseRoast(bitsToAnswers(bits, ROAST_QUESTIONS.length)));
    }
    expect(reached).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
  });

  it("全問浅煎り側なら1、全問深煎り側なら8になる", () => {
    expect(diagnoseRoast([0, 0, 0])).toBe(1);
    expect(diagnoseRoast([1, 1, 1])).toBe(8);
  });

  it("範囲外の回答 index は例外を投げる", () => {
    expect(() => diagnoseRoast([0, 9, 0])).toThrow(/invalid answer/);
  });
});

describe("diagnoseProcess", () => {
  it("回答の全組み合わせで7種すべての精製方法に到達できる", () => {
    const reached = new Set<string>();
    for (let bits = 0; bits < 2 ** PROCESS_QUESTIONS.length; bits++) {
      reached.add(
        diagnoseProcess(bitsToAnswers(bits, PROCESS_QUESTIONS.length)),
      );
    }
    expect(reached).toEqual(new Set(Object.keys(PROCESS_METHODS)));
  });

  it("回答のビット列がそのまま対応表の index になる", () => {
    // p1=1, p2=0, p3=1 → 0b101 = 5
    expect(diagnoseProcess([1, 0, 1])).toBe(PROCESS_BY_ANSWERS[5]);
  });

  it("範囲外の回答 index は例外を投げる", () => {
    expect(() => diagnoseProcess([0, 0, 9])).toThrow(/invalid answer/);
  });
});

describe("ランダム診断によるルート到達性（1000回試行）", () => {
  function randomAnswers(length: number): number[] {
    return Array.from({ length }, () => Math.round(Math.random()));
  }

  it("全16タイプが結果として出現する", () => {
    const counts = new Map<string, number>(
      Object.keys(RESULT_TYPES).map((id) => [id, 0]),
    );
    for (let i = 0; i < 1000; i++) {
      const id = diagnose(randomAnswers(QUESTIONS.length)).id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    for (const [id, count] of counts) {
      expect(count, `${id} が一度も出現しなかった`).toBeGreaterThan(0);
    }
  });

  it("全18種のフレーバー分類が結果として出現する", () => {
    const counts = new Map<string, number>(
      FLAVOR_CATEGORIES.map((c) => [c.id, 0]),
    );
    for (let i = 0; i < 1000; i++) {
      const baseAnswers = randomAnswers(QUESTIONS.length);
      const branch = flavorBranch(baseAnswers);
      const flavorAnswers = randomAnswers(FLAVOR_QUESTIONS[branch].length);
      for (const category of diagnoseFlavor(branch, flavorAnswers)) {
        counts.set(category.id, (counts.get(category.id) ?? 0) + 1);
      }
    }
    for (const [id, count] of counts) {
      expect(count, `${id} が一度も出現しなかった`).toBeGreaterThan(0);
    }
  });
});
