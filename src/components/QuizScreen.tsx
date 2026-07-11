import { useState } from "react";
import { FLAVOR_QUESTIONS, QUESTIONS } from "../data/questions";
import { flavorBranch } from "../logic/diagnose";

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
  const total = QUESTIONS.length + 3;
  const current = baseAnswers.length + flavorAnswers.length;

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
      <p className="quiz-progress-label">
        Q{current + 1} <span>/ {total}</span>
        {inFlavorStage && (
          <span className="quiz-stage">フレーバー深掘り中</span>
        )}
      </p>
      <progress className="quiz-progress" value={current} max={total} />
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
