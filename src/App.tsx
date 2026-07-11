import { useState } from "react";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { StartScreen } from "./components/StartScreen";
import { diagnose, diagnoseFlavor, flavorBranch } from "./logic/diagnose";
import { loadHistory, saveEntry } from "./storage/history";
import type { HistoryEntry } from "./types";

type Screen =
  | { name: "start" }
  | { name: "quiz" }
  | { name: "result"; entry: HistoryEntry };

function App() {
  const [history, setHistory] = useState(loadHistory);
  const [screen, setScreen] = useState<Screen>({ name: "start" });

  function complete(baseAnswers: number[], flavorAnswers: number[]) {
    const type = diagnose(baseAnswers);
    const flavors = diagnoseFlavor(flavorBranch(baseAnswers), flavorAnswers);
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      diagnosedAt: new Date().toISOString(),
      typeId: type.id,
      flavorIds: flavors.map((f) => f.id),
      baseAnswers,
      flavorAnswers,
    };
    setHistory(saveEntry(entry));
    setScreen({ name: "result", entry });
  }

  return (
    <main className="app">
      {screen.name === "start" && (
        <StartScreen
          history={history}
          onStart={() => setScreen({ name: "quiz" })}
          onSelect={(entry) => setScreen({ name: "result", entry })}
        />
      )}
      {screen.name === "quiz" && <QuizScreen onComplete={complete} />}
      {screen.name === "result" && (
        <ResultScreen
          entry={screen.entry}
          onRestart={() => setScreen({ name: "quiz" })}
          onBackToTop={() => setScreen({ name: "start" })}
        />
      )}
    </main>
  );
}

export default App;
