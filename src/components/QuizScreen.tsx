import { useState } from "react";
import { FLAVOR_QUESTIONS, QUESTIONS } from "../data/questions";
import { flavorBranch } from "../logic/diagnose";
import { quizProgress } from "../logic/quizProgress";

interface Props {
  onComplete: (baseAnswers: number[], flavorAnswers: number[]) => void;
}

export function QuizScreen({ onComplete }: Props) {
  const [baseAnswers, setBaseAnswers] = useState<number[]>([]);
  const [flavorAnswers, setFlavorAnswers] = useState<number[]>([]);

  const inFlavorStage = baseAnswers.length >= QUESTIONS.length;
  const flavorQuestions = inFlavorStage
    ? FLAVOR_QUESTIONS[flavorBranch(baseAnswers)]
    : null;
  const question = flavorQuestions
    ? flavorQuestions[flavorAnswers.length]
    : QUESTIONS[baseAnswers.length];
  const progress = quizProgress(baseAnswers, flavorAnswers);

  function select(index: number) {
    if (flavorQuestions) {
      const next = [...flavorAnswers, index];
      if (next.length === flavorQuestions.length) onComplete(baseAnswers, next);
      else setFlavorAnswers(next);
    } else {
      setBaseAnswers([...baseAnswers, index]);
    }
  }

  return (
    <div className="quiz">
      {/* 深掘り質問数は分岐で変わるため、件数表示はせず段階だけを示す */}
      <p className="quiz-stage">
        {flavorQuestions
          ? "好みを深掘りしています"
          : "基本的な好みをきいています"}
      </p>
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
