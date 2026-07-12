import { useState } from "react";
import {
  FLAVOR_QUESTIONS,
  PROCESS_QUESTIONS,
  QUESTIONS,
  ROAST_QUESTIONS,
} from "../data/questions";
import { flavorBranch } from "../logic/diagnose";
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
  questions: readonly StageQuestion[];
  answers: number[];
  setAnswers: (answers: number[]) => void;
}

export function QuizScreen({ onComplete }: Props) {
  const [baseAnswers, setBaseAnswers] = useState<number[]>([]);
  const [flavorAnswers, setFlavorAnswers] = useState<number[]>([]);
  const [roastAnswers, setRoastAnswers] = useState<number[]>([]);
  const [processAnswers, setProcessAnswers] = useState<number[]>([]);

  // 深掘り質問は基本質問が終わるまで分岐が決まらない。
  // 空配列のステージは「回答済み」とみなされスキップされるが、
  // 順序上、基本質問が終わる前に到達することはない
  const flavorQuestions =
    baseAnswers.length >= QUESTIONS.length
      ? FLAVOR_QUESTIONS[flavorBranch(baseAnswers)]
      : [];
  const stages: Stage[] = [
    {
      label: "基本的な好みをきいています",
      questions: QUESTIONS,
      answers: baseAnswers,
      setAnswers: setBaseAnswers,
    },
    {
      label: "好みを深掘りしています",
      questions: flavorQuestions,
      answers: flavorAnswers,
      setAnswers: setFlavorAnswers,
    },
    {
      label: "焙煎の好みをきいています",
      questions: ROAST_QUESTIONS,
      answers: roastAnswers,
      setAnswers: setRoastAnswers,
    },
    {
      label: "精製方法の好みをきいています",
      questions: PROCESS_QUESTIONS,
      answers: processAnswers,
      setAnswers: setProcessAnswers,
    },
  ];

  const stage = stages.find((s) => s.answers.length < s.questions.length);
  if (!stage) return null;
  const question = stage.questions[stage.answers.length];
  const progress = quizProgress(
    baseAnswers,
    flavorAnswers,
    roastAnswers,
    processAnswers,
  );

  function select(index: number) {
    if (!stage) return;
    const next = [...stage.answers, index];
    const isLastStage = stage === stages[stages.length - 1];
    if (isLastStage && next.length === stage.questions.length) {
      onComplete(baseAnswers, flavorAnswers, roastAnswers, next);
    } else {
      stage.setAnswers(next);
    }
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
      <h1 className="quiz-question">{question.text}</h1>
      <div className="quiz-choices">
        {question.choices.map((choice, i) => (
          <button
            type="button"
            key={choice.label}
            className="quiz-choice"
            onClick={() => select(i)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
