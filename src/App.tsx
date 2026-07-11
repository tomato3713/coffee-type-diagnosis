import { useEffect, useRef, useState } from "react";
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
  | { name: "tree"; highlight: FlavorCategoryId[] };

// フレーバーホイールはハッシュパス（#/wheel）で分ける。
// GitHub Pages のような静的ホスティングでも直接アクセスが 404 にならない
const WHEEL_HASH = "#/wheel";

// URL から表示すべき画面を導出する。?t=&f= の結果が自分の診断
// （lastEntry）と一致するなら、保存や日付のある結果画面として表示する
function screenFromLocation(lastEntry: HistoryEntry | null): Screen {
  const shared = decodeShareQuery(location.search);
  if (location.hash.startsWith(WHEEL_HASH)) {
    return { name: "tree", highlight: shared?.flavorIds ?? [] };
  }
  if (shared) {
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

// 表示中の結果を URL に反映する（シェア URL と同じ形式）。null でクエリを外す
function syncUrlQuery(result: SharedResult | null) {
  const query = result ? `?${encodeShareQuery(result)}` : "";
  if (location.search !== query || location.hash) {
    window.history.replaceState(null, "", `${location.pathname}${query}`);
  }
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
    syncUrlQuery(null);
    setScreen({ name: "quiz" });
  }

  function backToTop() {
    syncUrlQuery(null);
    setScreen({ name: "start" });
  }

  function showResult(entry: HistoryEntry) {
    lastEntryRef.current = entry;
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

  // 履歴に積んでツリーページへ。強調対象は URL の ?t=&f= から導出される
  function showTree() {
    window.history.pushState(
      null,
      "",
      `${location.pathname}${location.search}${WHEEL_HASH}`,
    );
    setScreen(screenFromLocation(lastEntryRef.current));
  }

  function backFromTree() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // 直接 #/wheel を開いた場合など、戻り先がないときはハッシュだけ外す
      window.history.replaceState(
        null,
        "",
        `${location.pathname}${location.search}`,
      );
      setScreen(screenFromLocation(lastEntryRef.current));
    }
  }

  return (
    <main className="app">
      {screen.name === "start" && (
        <StartScreen
          history={history}
          onStart={startQuiz}
          onSelect={showResult}
          onShowTree={showTree}
        />
      )}
      {screen.name === "quiz" && <QuizScreen onComplete={complete} />}
      {screen.name === "result" && (
        <ResultScreen
          entry={screen.entry}
          onRestart={startQuiz}
          onBackToTop={backToTop}
          onShowTree={showTree}
        />
      )}
      {screen.name === "shared" && (
        <SharedResultScreen
          result={screen.result}
          onStart={startQuiz}
          onShowTree={showTree}
          onBackToTop={backToTop}
        />
      )}
      {screen.name === "tree" && (
        <FlavorTreeScreen
          highlightIds={screen.highlight}
          onBack={backFromTree}
          backLabel={
            decodeShareQuery(location.search) ? "診断結果に戻る" : "トップへ"
          }
        />
      )}
    </main>
  );
}

export default App;
