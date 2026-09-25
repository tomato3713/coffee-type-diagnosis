import type { CuppingCriterionDef } from "../data/cupping";
import { isCuppingScore } from "../data/cupping";
import type { CuppingCriterionAnswer } from "../types";

// Prompt API の responseConstraint に渡す JSON Schema を作る。
// タグを enum で縛るのは、既存の語彙（結果カードや履歴で表示するタグ）から
// 外れた自由語をモデルが作ってしまうのを防ぐため
export function buildTastingSchema(criteria: CuppingCriterionDef[]) {
  return {
    type: "object",
    properties: Object.fromEntries(
      criteria.map((c) => [
        c.id,
        {
          type: "object",
          properties: {
            score: { type: "integer", minimum: 1, maximum: 10 },
            tags: {
              type: "array",
              items: { type: "string", enum: c.tagOptions },
            },
            note: { type: "string" },
          },
          required: ["score", "tags", "note"],
          additionalProperties: false,
        },
      ]),
    ),
    required: criteria.map((c) => c.id),
    additionalProperties: false,
  };
}

// 発話の文字起こしは user プロンプトとして別に渡し、指示とは混ぜない。
// 話した内容に指示っぽい文が含まれていても、指示として解釈されにくくするため
export function buildTastingSystemPrompt(
  criteria: CuppingCriterionDef[],
): string {
  const lines = criteria.map(
    (c) =>
      `- ${c.id}（${c.label}）: ${c.description}。スコア1=${c.scoreLowLabel}、10=${c.scoreHighLabel}`,
  );
  return [
    "あなたはコーヒーのカッピング記録を手伝うアシスタントです。",
    "ユーザーがコーヒーを飲みながら話した感想の文字起こしを読み、次の評価項目ごとに記録を作ってください。",
    ...lines,
    "ルール:",
    "- すべての項目に score を1〜10で付けてください。触れている項目は話した強さや好みから付けてください。",
    "- 触れていない項目も、感想全体の印象から推定して score を付けてください。その場合 tags は空、note は空文字にしてください。",
    "- tags は選択肢の中から、話した内容に合うものだけを選んでください。",
    "- note にはその項目について話した内容を、簡潔で自然な日本語に整えて書いてください。言い淀みや口癖は取り除いてください。",
  ].join("\n");
}

interface RawCriterionResult {
  score?: unknown;
  tags?: unknown;
  note?: unknown;
}

// モデルの出力は responseConstraint があっても信用せず、ここで検証する。
// 不正な項目は捨てて返すので、呼び出し側は全項目揃ったかを isComplete で
// 確かめ、欠けていればフォームで補ってもらう
export function parseTastingResponse(
  raw: string,
  criteria: CuppingCriterionDef[],
): CuppingCriterionAnswer[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (typeof parsed !== "object" || parsed === null) return [];
  const record = parsed as Record<string, RawCriterionResult | undefined>;

  return criteria.flatMap((c) => {
    const result = record[c.id];
    if (typeof result?.score !== "number" || !isCuppingScore(result.score)) {
      return [];
    }
    const tags = Array.isArray(result.tags)
      ? result.tags.filter(
          (t): t is string => typeof t === "string" && c.tagOptions.includes(t),
        )
      : [];
    const note = typeof result.note === "string" ? result.note.trim() : "";
    return [{ criterionId: c.id, score: result.score, tags, note }];
  });
}
