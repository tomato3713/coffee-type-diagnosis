import { useState } from "react";
import { FlavorTreeScreen } from "./components/FlavorTreeScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { SharedResultScreen } from "./components/SharedResultScreen";
import { StartScreen } from "./components/StartScreen";
import { diagnose, diagnoseFlavor, flavorBranch } from "./logic/diagnose";
import {
  decodeShareQuery,
  encodeShareQuery,
  type SharedResult,
} from "./logic/share";
import { loadHistory, saveEntry } from "./storage/history";
import type { FlavorCategoryId, HistoryEntry } from "./types";

type Screen =
  | { name: "start" }
  | { name: "quiz" }
  | { name: "result"; entry: HistoryEntry }
  | { name: "shared"; result: SharedResult }
  | { name: "tree"; highlight: FlavorCategoryId[]; back: Screen };

// 表示中の結果を URL に反映する（シェア URL と同じ形式）。null でクエリを外す
function syncUrlQuery(result: SharedResult | null) {
  const query = result ? `?${encodeShareQuery(result)}` : "";
  if (location.search !== query) {
    window.history.replaceState(null, "", `${location.pathname}${query}`);
  }
}

function App() {
  const [history, setHistory] = useState(loadHistory);
  const [screen, setScreen] = useState<Screen>(() => {
    const shared = decodeShareQuery(location.search);
    return shared ? { name: "shared", result: shared } : { name: "start" };
  });

  function startQuiz() {
    syncUrlQuery(null);
    setScreen({ name: "quiz" });
  }

  function backToTop() {
    syncUrlQuery(null);
    setScreen({ name: "start" });
  }

  function showResult(entry: HistoryEntry) {
    syncUrlQuery({ typeId: entry.typeId, flavorIds: entry.flavorIds });
    setScreen({ name: "result", entry });
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
    showResult(entry);
  }

  function showTree(highlight: FlavorCategoryId[]) {
    setScreen((current) => ({ name: "tree", highlight, back: current }));
  }

  return (
    <main className="app">
      {screen.name === "start" && (
        <StartScreen
          history={history}
          onStart={startQuiz}
          onSelect={showResult}
          onShowTree={() => showTree([])}
        />
      )}
      {screen.name === "quiz" && <QuizScreen onComplete={complete} />}
      {screen.name === "result" && (
        <ResultScreen
          entry={screen.entry}
          onRestart={startQuiz}
          onBackToTop={backToTop}
          onShowTree={() => showTree(screen.entry.flavorIds)}
        />
      )}
      {screen.name === "shared" && (
        <SharedResultScreen
          result={screen.result}
          onStart={startQuiz}
          onShowTree={() => showTree(screen.result.flavorIds)}
        />
      )}
      {screen.name === "tree" && (
        <FlavorTreeScreen
          highlightIds={screen.highlight}
          onBack={() => setScreen(screen.back)}
        />
      )}
    </main>
  );
}

export default App;
