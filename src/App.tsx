import { useEffect, useRef, useState } from "react";
import { FlavorTreeScreen } from "./components/FlavorTreeScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { SharedResultScreen } from "./components/SharedResultScreen";
import { StartScreen } from "./components/StartScreen";
import { diagnose, diagnoseFlavor, flavorBranch } from "./logic/diagnose";
import {
  buildResultHash,
  buildWheelHash,
  decodeShareQuery,
  parseHashRoute,
  RESULT_PATH,
  type SharedResult,
  WHEEL_PATH,
} from "./logic/share";
import { loadHistory, saveEntry } from "./storage/history";
import type { HistoryEntry } from "./types";

type Screen =
  | { name: "start" }
  | { name: "quiz" }
  | { name: "result"; entry: HistoryEntry }
  | { name: "shared"; result: SharedResult }
  | { name: "tree"; highlight: SharedResult | null };

// URL（#/result?t=&f= / #/wheel?t=&f=）から表示すべき画面を導出する。
// 結果が自分の診断（lastEntry）と一致するなら、保存や日付のある
// 結果画面として表示する
function screenFromLocation(lastEntry: HistoryEntry | null): Screen {
  const { path, query } = parseHashRoute(location.hash);
  const shared = decodeShareQuery(query);
  if (path === WHEEL_PATH) {
    return { name: "tree", highlight: shared };
  }
  if (path === RESULT_PATH && shared) {
    if (
      lastEntry &&
      lastEntry.typeId === shared.typeId &&
      lastEntry.flavorIds.join() === shared.flavorIds.join()
    ) {
      return { name: "result", entry: lastEntry };
    }
    return { name: "shared", result: shared };
  }
  return { name: "start" };
}

function replaceHash(hash: string) {
  window.history.replaceState(null, "", `${location.pathname}${hash}`);
}

function App() {
  const [history, setHistory] = useState(loadHistory);
  const lastEntryRef = useRef<HistoryEntry | null>(null);
  const [screen, setScreen] = useState<Screen>(() => screenFromLocation(null));

  // ブラウザの戻る / 進むで画面を復元する
  useEffect(() => {
    const onPopState = () =>
      setScreen(screenFromLocation(lastEntryRef.current));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function startQuiz() {
    replaceHash("");
    setScreen({ name: "quiz" });
  }

  function backToTop() {
    replaceHash("");
    setScreen({ name: "start" });
  }

  function showResult(entry: HistoryEntry) {
    lastEntryRef.current = entry;
    replaceHash(
      buildResultHash({ typeId: entry.typeId, flavorIds: entry.flavorIds }),
    );
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

  // 履歴に積んでツリーページへ。ブラウザの戻るで呼び出し元へ戻れる
  function showTree(highlight: SharedResult | null) {
    window.history.pushState(
      null,
      "",
      `${location.pathname}${buildWheelHash(highlight)}`,
    );
    setScreen({ name: "tree", highlight });
  }

  function backFromTree() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    // 直接 #/wheel を開いた場合など戻り先がないときは、結果があれば
    // 結果画面へ、なければトップへ
    const highlight = screen.name === "tree" ? screen.highlight : null;
    replaceHash(highlight ? buildResultHash(highlight) : "");
    setScreen(screenFromLocation(lastEntryRef.current));
  }

  return (
    <main className="app">
      {screen.name === "start" && (
        <StartScreen
          history={history}
          onStart={startQuiz}
          onSelect={showResult}
          onShowTree={() => showTree(null)}
        />
      )}
      {screen.name === "quiz" && <QuizScreen onComplete={complete} />}
      {screen.name === "result" && (
        <ResultScreen
          entry={screen.entry}
          onRestart={startQuiz}
          onBackToTop={backToTop}
          onShowTree={() =>
            showTree({
              typeId: screen.entry.typeId,
              flavorIds: screen.entry.flavorIds,
            })
          }
        />
      )}
      {screen.name === "shared" && (
        <SharedResultScreen
          result={screen.result}
          onStart={startQuiz}
          onShowTree={() => showTree(screen.result)}
          onBackToTop={backToTop}
        />
      )}
      {screen.name === "tree" && (
        <FlavorTreeScreen
          highlightIds={screen.highlight?.flavorIds ?? []}
          onBack={backFromTree}
          backLabel={screen.highlight ? "診断結果に戻る" : "トップへ"}
        />
      )}
    </main>
  );
}

export default App;
