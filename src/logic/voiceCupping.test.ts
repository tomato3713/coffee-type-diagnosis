import { describe, expect, it } from "vitest";
import { criteriaForMode } from "../data/cupping";
import {
  buildTastingSchema,
  buildTastingSystemPrompt,
  parseTastingResponse,
} from "./voiceCupping";

const simple = criteriaForMode("simple");

function unmentioned() {
  return { mentioned: false, score: 5, tags: [], note: "" };
}

describe("buildTastingSchema", () => {
  it("評価項目ごとのプロパティをすべて必須にする", () => {
    const schema = buildTastingSchema(simple);
    expect(schema.required).toEqual(simple.map((c) => c.id));
    expect(Object.keys(schema.properties)).toEqual(simple.map((c) => c.id));
  });

  it("タグの選択肢を項目の語彙に限定する", () => {
    const schema = buildTastingSchema(simple);
    const acidity = simple.find((c) => c.id === "acidity");
    expect(schema.properties.acidity.properties.tags.items.enum).toEqual(
      acidity?.tagOptions,
    );
  });
});

describe("buildTastingSystemPrompt", () => {
  it("各項目のスコアの両端の意味を指示に含める", () => {
    const prompt = buildTastingSystemPrompt(simple);
    for (const c of simple) {
      expect(prompt).toContain(c.scoreLowLabel);
      expect(prompt).toContain(c.scoreHighLabel);
    }
  });
});

describe("parseTastingResponse", () => {
  it("言及された項目だけを回答として返す", () => {
    const raw = JSON.stringify({
      acidity: {
        mentioned: true,
        score: 8,
        tags: ["レモンのような"],
        note: " 明るい酸味 ",
      },
      sweetness: unmentioned(),
      mouthfeel: unmentioned(),
      overall: unmentioned(),
    });
    expect(parseTastingResponse(raw, simple)).toEqual([
      {
        criterionId: "acidity",
        score: 8,
        tags: ["レモンのような"],
        note: "明るい酸味",
      },
    ]);
  });

  it("語彙にないタグは除外する", () => {
    const raw = JSON.stringify({
      acidity: {
        mentioned: true,
        score: 7,
        tags: ["レモンのような", "グレープフルーツ"],
        note: "",
      },
    });
    expect(parseTastingResponse(raw, simple)[0].tags).toEqual([
      "レモンのような",
    ]);
  });

  it("1〜10の整数でないスコアの項目は捨てる", () => {
    const raw = JSON.stringify({
      acidity: { mentioned: true, score: 11, tags: [], note: "" },
      sweetness: { mentioned: true, score: 6.5, tags: [], note: "" },
    });
    expect(parseTastingResponse(raw, simple)).toEqual([]);
  });

  it("JSONとして読めない出力なら空配列を返す", () => {
    expect(parseTastingResponse("すみません", simple)).toEqual([]);
  });

  it("評価対象外の項目が出力に含まれていても無視する", () => {
    const raw = JSON.stringify({
      flavor: { mentioned: true, score: 9, tags: [], note: "" },
    });
    expect(parseTastingResponse(raw, simple)).toEqual([]);
  });
});
