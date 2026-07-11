import { useState } from "react";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { SharedResultScreen } from "./components/SharedResultScreen";
import { StartScreen } from "./components/StartScreen";
import { diagnose, diagnoseFlavor, flavorBranch } from "./logic/diagnose";
import { decodeShareQuery, type SharedResult } from "./logic/share";
import { loadHistory, saveEntry } from "./storage/history";
import type { HistoryEntry } from "./types";

type Screen =
  | { name: "start" }
  | { name: "quiz" }
  | { name: "result"; entry: HistoryEntry }
  | { name: "shared"; result: SharedResult };

function App() {
  const [history, setHistory] = useState(loadHistory);
  const [screen, setScreen] = useState<Screen>(() => {
    const shared = decodeShareQuery(location.search);
    return shared ? { name: "shared", result: shared } : { name: "start" };
  });

  function startQuiz() {
    // シェア URL から診断を始めたとき、古い結果のクエリを URL に残さない
    if (location.search)
      window.history.replaceState(null, "", location.pathname);
    setScreen({ name: "quiz" });
  }

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
          onStart={startQuiz}
          onSelect={(entry) => setScreen({ name: "result", entry })}
        />
      )}
      {screen.name === "quiz" && <QuizScreen onComplete={complete} />}
      {screen.name === "result" && (
        <ResultScreen
          entry={screen.entry}
          onRestart={startQuiz}
          onBackToTop={() => setScreen({ name: "start" })}
        />
      )}
      {screen.name === "shared" && (
        <SharedResultScreen result={screen.result} onStart={startQuiz} />
      )}
    </main>
  );
}

export default App;
