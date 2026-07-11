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
      {/* 深掘り質問数は分岐で変わるため、件数表示は出さずバーのみで進捗を示す */}
      <progress
        className="quiz-progress"
        value={flavorQuestions ? flavorAnswers.length : baseAnswers.length}
        max={flavorQuestions ? flavorQuestions.length : QUESTIONS.length}
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
