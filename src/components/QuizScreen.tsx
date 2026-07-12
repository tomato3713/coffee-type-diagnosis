import { useState } from "react";
import {
  FLAVOR_QUESTIONS,
  MAX_FLAVOR_QUESTION_COUNT,
  PROCESS_QUESTIONS,
  QUESTIONS,
  ROAST_QUESTIONS,
} from "../data/questions";
import { flavorBranch } from "../logic/diagnose";
import {
  quizProgress,
  splitAnswers,
  totalQuestionCount,
} from "../logic/quizFlow";

interface Props {
  onComplete: (
    baseAnswers: number[],
    flavorAnswers: number[],
    roastAnswers: number[],
    processAnswers: number[],
  ) => void;
}

// 各ステージの質問に共通する、画面表示に必要な形
interface StageQuestion {
  text: string;
  choices: readonly { label: string }[];
}

interface StageDef {
  label: string;
  // ナビゲーションマップに表示する短いステージ名
  short: string;
  questions: readonly StageQuestion[];
  // 深掘りの分岐が確定するまでのドット数の見積もり（questions が空の間だけ使う）
  placeholderCount?: number;
}

export function QuizScreen({ onComplete }: Props) {
  // 回答は全ステージを通した1本の列で持ち、cursor が表示中の質問位置。
  // 前の質問に戻っても回答は保持され、同じ選択肢を選び直せばその先の
  // 回答もそのまま生きる
  const [answers, setAnswers] = useState<number[]>([]);
  const [cursor, setCursor] = useState(0);

  const baseAnswers = answers.slice(0, QUESTIONS.length);
  const flavorQuestions =
    baseAnswers.length >= QUESTIONS.length
      ? FLAVOR_QUESTIONS[flavorBranch(baseAnswers)]
      : [];
  const stageDefs: StageDef[] = [
    {
      label: "基本的な好みをきいています",
      short: "基本",
      questions: QUESTIONS,
    },
    {
      label: "好みを深掘りしています",
      short: "深掘り",
      questions: flavorQuestions,
      placeholderCount: MAX_FLAVOR_QUESTION_COUNT,
    },
    {
      label: "焙煎の好みをきいています",
      short: "焙煎度",
      questions: ROAST_QUESTIONS,
    },
    {
      label: "精製方法の好みをきいています",
      short: "精製方法",
      questions: PROCESS_QUESTIONS,
    },
  ];

  // 各ステージに先頭質問の通し位置（offset）とドット数（count）を持たせる。
  // 分岐確定前の深掘りは見積もりドット（回答不可）でレイアウトだけ確保する
  let dotOffset = 0;
  const stages = stageDefs.map((def) => {
    const count = def.questions.length || def.placeholderCount || 0;
    const stage = { ...def, offset: dotOffset, count };
    dotOffset += count;
    return stage;
  });

  // cursor の位置にあるステージ。分岐確定前は深掘り以降に到達しないため、
  // 見積もり count を含む offset でも位置がずれることはない
  const stage = stages.find(
    (s) => cursor < s.offset + s.questions.length && cursor >= s.offset,
  );
  if (!stage) return null;
  const question = stage.questions[cursor - stage.offset];

  // 進捗は表示中の位置（cursor）まで。戻ればバーも戻る
  const progress = quizProgress(answers.slice(0, cursor));

  function select(index: number) {
    // 戻った質問で同じ選択肢を選んだ場合は、以降の回答を保持して先へ進む
    if (cursor < answers.length && answers[cursor] === index) {
      setCursor(cursor + 1);
      return;
    }
    // 回答を変えると深掘りの分岐が変わりうるため、以降の回答は破棄する
    const next = [...answers.slice(0, cursor), index];
    if (next.length === totalQuestionCount(next)) {
      const s = splitAnswers(next);
      onComplete(
        s.baseAnswers,
        s.flavorAnswers,
        s.roastAnswers,
        s.processAnswers,
      );
      return;
    }
    setAnswers(next);
    setCursor(cursor + 1);
  }

  return (
    <div className="quiz">
      {/* 深掘り質問数は分岐で変わるため、件数表示はせず段階だけを示す */}
      <p className="quiz-stage">{stage.label}</p>
      <progress
        className="quiz-progress"
        value={progress.value}
        max={progress.max}
      />
      {/* 段階ごとの質問マップ。回答済みの質問をタップして戻れる */}
      <nav className="quiz-map" aria-label="質問の一覧">
        {stages.map((group) => (
          <div className="quiz-map-stage" key={group.short}>
            <span className="quiz-map-label">{group.short}</span>
            <div className="quiz-map-dots">
              {Array.from({ length: group.count }, (_, i) => {
                const pos = group.offset + i;
                const state =
                  pos === cursor
                    ? " is-current"
                    : pos < answers.length
                      ? " is-answered"
                      : "";
                return (
                  <button
                    type="button"
                    // biome-ignore lint/suspicious/noArrayIndexKey: 質問の通し位置そのものが識別子
                    key={i}
                    className={`quiz-map-dot${state}`}
                    aria-label={`${group.short}の質問${i + 1}へ`}
                    disabled={pos > answers.length}
                    onClick={() => setCursor(pos)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <h1 className="quiz-question">{question.text}</h1>
      <div className="quiz-choices">
        {question.choices.map((choice, i) => (
          <button
            type="button"
            key={choice.label}
            className={`quiz-choice${answers[cursor] === i ? " is-selected" : ""}`}
            onClick={() => select(i)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <div className="quiz-nav">
        <button
          type="button"
          className="quiz-nav-button"
          onClick={() => setCursor(cursor - 1)}
          disabled={cursor === 0}
        >
          ← 前の質問
        </button>
        <button
          type="button"
          className="quiz-nav-button"
          onClick={() => setCursor(cursor + 1)}
          disabled={cursor >= answers.length}
        >
          次の質問 →
        </button>
      </div>
    </div>
  );
}
