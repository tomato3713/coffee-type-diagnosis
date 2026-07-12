import { useState } from "react";
import {
  FLAVOR_QUESTIONS,
  PROCESS_QUESTIONS,
  QUESTIONS,
  ROAST_QUESTIONS,
} from "../data/questions";
import { flavorBranch } from "../logic/diagnose";
import { splitAnswers, totalQuestionCount } from "../logic/quizFlow";
import { quizProgress } from "../logic/quizProgress";

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

interface Stage {
  label: string;
  // ナビゲーションマップに表示する短いステージ名
  short: string;
  questions: readonly StageQuestion[];
  // 深掘りの分岐が確定するまでのドット数の見積もり（questions が空の間だけ使う）
  placeholderCount?: number;
}

const MAX_FLAVOR_QUESTIONS = Math.max(
  ...Object.values(FLAVOR_QUESTIONS).map((questions) => questions.length),
);

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
  const stages: Stage[] = [
    {
      label: "基本的な好みをきいています",
      short: "基本",
      questions: QUESTIONS,
    },
    {
      label: "好みを深掘りしています",
      short: "深掘り",
      questions: flavorQuestions,
      placeholderCount: MAX_FLAVOR_QUESTIONS,
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

  // ナビゲーションマップ用に、各ステージの先頭質問の通し位置を求める。
  // 分岐確定前の深掘りは見積もりドット（回答不可）でレイアウトだけ確保する
  let dotOffset = 0;
  const mapStages = stages.map((s) => {
    const count = s.questions.length || s.placeholderCount || 0;
    const group = { short: s.short, offset: dotOffset, count };
    dotOffset += count;
    return group;
  });

  // cursor の位置にあるステージと質問を探す
  let indexInStage = cursor;
  let stage = stages[0];
  for (const s of stages) {
    if (indexInStage < s.questions.length) {
      stage = s;
      break;
    }
    indexInStage -= s.questions.length;
  }
  const question = stage.questions[indexInStage];

  // 進捗は表示中の位置（cursor）まで。戻ればバーも戻る
  const upToCursor = splitAnswers(answers.slice(0, cursor));
  const progress = quizProgress(
    upToCursor.baseAnswers,
    upToCursor.flavorAnswers,
    upToCursor.roastAnswers,
    upToCursor.processAnswers,
  );

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
        {mapStages.map((group) => (
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
