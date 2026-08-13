import { useEffect, useRef, useState } from "react";
import { CuppingResultScreen } from "./components/CuppingResultScreen";
import {
  type CuppingFirstDraft,
  CuppingScreen,
} from "./components/CuppingScreen";
import { CuppingSetupScreen } from "./components/CuppingSetupScreen";
import { FlavorTreeScreen } from "./components/FlavorTreeScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { SharedResultScreen } from "./components/SharedResultScreen";
import { StartScreen } from "./components/StartScreen";
import { CUPPING_CRITERIA, criteriaForMode } from "./data/cupping";
import { trackPageView } from "./logic/analytics";
import { cuppingModeOf } from "./logic/cupping";
import {
  diagnose,
  diagnoseFlavor,
  diagnoseProcess,
  diagnoseRoast,
  flavorBranch,
} from "./logic/diagnose";
import {
  buildCuppingEditHash,
  buildCuppingResultHash,
  buildResultHash,
  buildWheelHash,
  CUPPING_EDIT_PATH,
  CUPPING_RESULT_PATH,
  decodeCuppingEditQuery,
  decodeCuppingResultId,
  decodeShareQuery,
  parseHashRoute,
  RESULT_PATH,
  type SharedResult,
  WHEEL_PATH,
} from "./logic/share";
import { loadCuppingHistory, saveCuppingEntry } from "./storage/cuppingHistory";
import { loadHistory, saveEntry } from "./storage/history";
import type {
  CoffeeInfo,
  CuppingCriterionAnswer,
  CuppingHistoryEntry,
  CuppingMode,
  HistoryEntry,
} from "./types";

type Screen =
  | { name: "start" }
  | { name: "quiz" }
  | { name: "result"; entry: HistoryEntry }
  | { name: "shared"; result: SharedResult }
  | { name: "tree"; highlight: SharedResult | null }
  | {
      name: "cuppingSetup";
      initialInfo?: CoffeeInfo;
      editingEntry?: CuppingHistoryEntry;
      // cupping 画面の1問目から戻ってきた場合、その入力内容とモードを持ち運ぶ
      pendingFirstDraft?: CuppingFirstDraft;
      pendingMode?: CuppingMode;
    }
  | {
      name: "cupping";
      coffeeInfo: CoffeeInfo;
      // このカッピングが保存されるときのモード。通常再編集時は既存entryの
      // モードのまま、アップグレード時は強制的に "detailed" にする
      mode: CuppingMode;
      // 結果画面から項目を編集し直す場合に渡す
      editing?: { entry: CuppingHistoryEntry; startIndex: number };
      // 情報入力画面から戻ってきた場合、1問目の入力内容を復元する
      initialFirstDraft?: CuppingFirstDraft;
    }
  | { name: "cuppingResult"; entry: CuppingHistoryEntry };

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
      lastEntry.roast === shared.roast &&
      lastEntry.process === shared.process &&
      lastEntry.flavorIds.join() === shared.flavorIds.join()
    ) {
      return { name: "result", entry: lastEntry };
    }
    return { name: "shared", result: shared };
  }
  if (path === CUPPING_RESULT_PATH) {
    const id = decodeCuppingResultId(query);
    const entry = id
      ? loadCuppingHistory().find((e) => e.id === id)
      : undefined;
    if (entry) return { name: "cuppingResult", entry };
  }
  if (path === CUPPING_EDIT_PATH) {
    const target = decodeCuppingEditQuery(query);
    const entry = target
      ? loadCuppingHistory().find((e) => e.id === target.id)
      : undefined;
    if (entry && target) {
      const coffeeInfo = {
        coffeeName: entry.coffeeName,
        variety: entry.variety,
        processMethod: entry.processMethod,
        purchaseLocation: entry.purchaseLocation,
        imageDataUrl: entry.imageDataUrl,
      };
      // criterionId が entry の現在のモードの項目集合に含まれれば通常の
      // 再編集。含まれなければ、アップグレード再開として detailed で復元する
      const entryMode = cuppingModeOf(entry);
      const localIndex = criteriaForMode(entryMode).findIndex(
        (c) => c.id === target.criterionId,
      );
      if (localIndex !== -1) {
        return {
          name: "cupping",
          coffeeInfo,
          mode: entryMode,
          editing: { entry, startIndex: localIndex },
        };
      }
      const detailedIndex = CUPPING_CRITERIA.findIndex(
        (c) => c.id === target.criterionId,
      );
      if (detailedIndex !== -1) {
        return {
          name: "cupping",
          coffeeInfo,
          mode: "detailed",
          editing: { entry, startIndex: detailedIndex },
        };
      }
    }
  }
  return { name: "start" };
}

function replaceHash(hash: string) {
  window.history.replaceState(null, "", `${location.pathname}${hash}`);
}

function sharedResultOf(entry: HistoryEntry): SharedResult {
  return {
    typeId: entry.typeId,
    roast: entry.roast,
    process: entry.process,
    flavorIds: entry.flavorIds,
  };
}

// GA4 に送る仮想ページパス。quiz は自身の URL を持たない（start と同じ
// 空ハッシュ）ため、location.hash ではなく画面状態から直接導出する
function screenPath(screen: Screen): string {
  switch (screen.name) {
    case "start":
      return "/";
    case "quiz":
      return "/quiz";
    case "result":
      return "/result";
    case "shared":
      return "/shared";
    case "tree":
      return "/wheel";
    case "cuppingSetup":
      return "/cupping/setup";
    case "cupping":
      return "/cupping";
    case "cuppingResult":
      return "/cupping/result";
  }
}

function App() {
  const [history, setHistory] = useState(loadHistory);
  const [cuppingHistory, setCuppingHistory] = useState(loadCuppingHistory);
  const lastEntryRef = useRef<HistoryEntry | null>(null);
  const [screen, setScreen] = useState<Screen>(() => screenFromLocation(null));

  // ブラウザの戻る / 進むで画面を復元する
  useEffect(() => {
    const onPopState = () =>
      setScreen(screenFromLocation(lastEntryRef.current));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // 画面遷移のたびに GA4 へ仮想ページビューを送る
  useEffect(() => {
    trackPageView(screenPath(screen));
  }, [screen]);

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
    replaceHash(buildResultHash(sharedResultOf(entry)));
    setScreen({ name: "result", entry });
  }

  function complete(
    baseAnswers: number[],
    flavorAnswers: number[],
    roastAnswers: number[],
    processAnswers: number[],
  ) {
    const type = diagnose(baseAnswers);
    const flavors = diagnoseFlavor(flavorBranch(baseAnswers), flavorAnswers);
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      diagnosedAt: new Date().toISOString(),
      typeId: type.id,
      roast: diagnoseRoast(roastAnswers),
      process: diagnoseProcess(processAnswers),
      flavorIds: flavors.map((f) => f.id),
      baseAnswers,
      flavorAnswers,
      roastAnswers,
      processAnswers,
    };
    setHistory(saveEntry(entry));
    showResult(entry);
  }

  function startCupping() {
    replaceHash("");
    setScreen({ name: "cuppingSetup" });
  }

  function startCuppingWithInfo(
    info: CoffeeInfo,
    mode: CuppingMode,
    initialFirstDraft?: CuppingFirstDraft,
  ) {
    setScreen({ name: "cupping", coffeeInfo: info, mode, initialFirstDraft });
  }

  function editCoffeeInfo(entry: CuppingHistoryEntry) {
    setScreen({
      name: "cuppingSetup",
      initialInfo: {
        coffeeName: entry.coffeeName,
        variety: entry.variety,
        processMethod: entry.processMethod,
        purchaseLocation: entry.purchaseLocation,
        imageDataUrl: entry.imageDataUrl,
      },
      editingEntry: entry,
    });
  }

  // 履歴に積んで結果画面へ。ブラウザの戻るで呼び出し元へ戻れる
  function showCuppingResult(entry: CuppingHistoryEntry) {
    window.history.pushState(
      null,
      "",
      `${location.pathname}${buildCuppingResultHash(entry.id)}`,
    );
    setScreen({ name: "cuppingResult", entry });
  }

  // 結果画面で項目をクリックしたときに、その項目からやり直せるようにする。
  // どの結果を編集中かをURLに残す
  function editCuppingCriterion(entry: CuppingHistoryEntry, index: number) {
    const mode = cuppingModeOf(entry);
    const criteria = criteriaForMode(mode);
    replaceHash(buildCuppingEditHash(entry.id, criteria[index].id));
    setScreen({
      name: "cupping",
      coffeeInfo: {
        coffeeName: entry.coffeeName,
        variety: entry.variety,
        processMethod: entry.processMethod,
        purchaseLocation: entry.purchaseLocation,
        imageDataUrl: entry.imageDataUrl,
      },
      mode,
      editing: { entry, startIndex: index },
    });
  }

  // 簡易モードの記録を、残りの項目を追加入力できる詳細モードへ切り替える。
  // 逆方向（detailed→simple）は入力済みデータの損失を伴うため提供しない
  function upgradeToDetailedCupping(entry: CuppingHistoryEntry) {
    const startIndex = CUPPING_CRITERIA.findIndex(
      (c) => !entry.answers.some((a) => a.criterionId === c.id),
    );
    const index = startIndex === -1 ? 0 : startIndex;
    replaceHash(buildCuppingEditHash(entry.id, CUPPING_CRITERIA[index].id));
    setScreen({
      name: "cupping",
      coffeeInfo: {
        coffeeName: entry.coffeeName,
        variety: entry.variety,
        processMethod: entry.processMethod,
        purchaseLocation: entry.purchaseLocation,
        imageDataUrl: entry.imageDataUrl,
      },
      mode: "detailed",
      editing: { entry, startIndex: index },
    });
  }

  // カッピングはシェア機能を持たないため、診断結果と違いURLに状態を持たせない。
  // editingEntry がある場合は新規作成ではなく既存エントリの更新になる
  function completeCupping(
    answers: CuppingCriterionAnswer[],
    coffeeInfo: CoffeeInfo,
    editingEntry: CuppingHistoryEntry | null,
    mode: CuppingMode,
  ) {
    const entry: CuppingHistoryEntry = editingEntry
      ? {
          ...editingEntry,
          answers,
          mode,
          coffeeName: coffeeInfo.coffeeName,
          variety: coffeeInfo.variety,
          processMethod: coffeeInfo.processMethod,
          purchaseLocation: coffeeInfo.purchaseLocation,
          imageDataUrl: coffeeInfo.imageDataUrl,
        }
      : {
          id: crypto.randomUUID(),
          cuppedAt: new Date().toISOString(),
          ...coffeeInfo,
          mode,
          answers,
        };
    setCuppingHistory(saveCuppingEntry(entry));
    showCuppingResult(entry);
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
          cuppingHistory={cuppingHistory}
          onStartCupping={startCupping}
          onSelectCupping={showCuppingResult}
        />
      )}
      {screen.name === "quiz" && <QuizScreen onComplete={complete} />}
      {screen.name === "result" && (
        <ResultScreen
          entry={screen.entry}
          onRestart={startQuiz}
          onBackToTop={backToTop}
          onShowTree={() => showTree(sharedResultOf(screen.entry))}
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
      {screen.name === "cuppingSetup" && (
        <CuppingSetupScreen
          onStart={(info, mode) => {
            if (screen.editingEntry) {
              // isEditing時はモード選択UIを隠しているため、ここのmodeは無視する。
              // URL は結果画面に来たときのまま変えていないため、ここで
              // pushState すると同じ結果ページの履歴エントリが重複する
              const updated = { ...screen.editingEntry, ...info };
              setCuppingHistory(saveCuppingEntry(updated));
              setScreen({ name: "cuppingResult", entry: updated });
            } else {
              startCuppingWithInfo(info, mode, screen.pendingFirstDraft);
            }
          }}
          onBackToTop={backToTop}
          initialInfo={screen.initialInfo}
          initialMode={screen.pendingMode}
          isEditing={!!screen.editingEntry}
        />
      )}
      {screen.name === "cupping" && (
        <CuppingScreen
          criteria={criteriaForMode(screen.mode)}
          onComplete={(answers) =>
            completeCupping(
              answers,
              screen.coffeeInfo,
              screen.editing?.entry ?? null,
              screen.mode,
            )
          }
          onBackToSetup={
            screen.editing
              ? undefined
              : (firstDraft) => {
                  replaceHash("");
                  setScreen({
                    name: "cuppingSetup",
                    initialInfo: screen.coffeeInfo,
                    pendingFirstDraft: firstDraft,
                    pendingMode: screen.mode,
                  });
                }
          }
          initialAnswers={screen.editing?.entry.answers}
          initialCursor={screen.editing?.startIndex}
          initialFirstDraft={screen.initialFirstDraft}
        />
      )}
      {screen.name === "cuppingResult" && (
        <CuppingResultScreen
          entry={screen.entry}
          onRestart={startCupping}
          onBackToTop={backToTop}
          onEditCriterion={(index) => editCuppingCriterion(screen.entry, index)}
          onEditCoffeeInfo={() => editCoffeeInfo(screen.entry)}
          onUpgradeToDetailed={() => upgradeToDetailedCupping(screen.entry)}
          onUpdateCoffeeName={(name) => {
            const updated = { ...screen.entry, coffeeName: name };
            setCuppingHistory(saveCuppingEntry(updated));
            setScreen({ name: "cuppingResult", entry: updated });
          }}
        />
      )}
    </main>
  );
}

export default App;
