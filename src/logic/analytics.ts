// GA4 の測定 ID。ビルド時の環境変数 VITE_GA_MEASUREMENT_ID から読む
// （GitHub Actions の Variables 等で設定する）。未設定の間は計測しない
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? "";

// true にすると各イベントに debug_mode を付け、GA4 の DebugView で
// リアルタイムに確認できるようにする（本番の集計対象からは除外される）
export const GA_DEBUG_MODE = import.meta.env.VITE_GA_DEBUG_MODE === "true";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer?.push(args);
}

function withDebugMode(
  params: Record<string, unknown>,
  debugMode: boolean,
): Record<string, unknown> {
  return debugMode ? { ...params, debug_mode: true } : params;
}

// gtag.js を読み込んで初期化する。SPA なので自動送信の page_view はオフにし、
// 画面遷移ごとに trackPageView から仮想ページビューを送る
export function initAnalytics(
  measurementId: string = GA_MEASUREMENT_ID,
  debugMode: boolean = GA_DEBUG_MODE,
): void {
  if (!measurementId) return;
  window.dataLayer = window.dataLayer ?? [];
  gtag("js", new Date());
  gtag(
    "config",
    measurementId,
    withDebugMode({ send_page_view: false }, debugMode),
  );

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

// ハッシュルーティングの SPA では自動計測が効かないため、画面遷移ごとに
// 呼び出して仮想ページビューを送る。path は "/" "/quiz" のような表示上の画面名
export function trackPageView(
  path: string,
  measurementId: string = GA_MEASUREMENT_ID,
  debugMode: boolean = GA_DEBUG_MODE,
): void {
  if (!measurementId) return;
  gtag(
    "event",
    "page_view",
    withDebugMode(
      {
        page_path: path,
        page_location: `${location.origin}${location.pathname}#${path}`,
      },
      debugMode,
    ),
  );
}
