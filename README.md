# ☕ コーヒータイプ診断

[![CI](https://github.com/tomato3713/coffee-type-diagnosis/actions/workflows/ci.yml/badge.svg)](https://github.com/tomato3713/coffee-type-diagnosis/actions/workflows/ci.yml)

質問に答えるだけで、あなた好みのコーヒーの**品種・産地・フレーバー・飲み方**がわかる診断 Web アプリです。

公開 URL: https://tomato3713.github.io/coffee-type-diagnosis/

## 特徴

- **コーヒーの知識は不要**。「お茶を選ぶなら？」「デザートを選ぶなら？」といった日常の嗜好を聞く15問（基本12問＋フレーバー深掘り3問）に答えるだけ
- 結果は**16タイプ**。品種・産地・おすすめの飲み方を提案
- フレーバーは **SCA フレーバーホイール（2016年版）** のどの部分に該当するかを、大分類 → 中分類 → 具体的なノート（例: 果実 → ベリー系 → ブルーベリー）で表示
- 診断結果はブラウザの localStorage に保存され、トップ画面から過去の結果を再表示可能（最大50件）
- 結果カードを **PNG 画像としてダウンロード**できる
- SCA フレーバーホイール全体を**ズーム・パン可能なツリー**で眺められ、診断結果の好みフレーバーのラインを強調表示できる

## クイックスタート

前提: Node.js 24 以上 / pnpm 10 以上

```sh
git clone https://github.com/tomato3713/coffee-type-diagnosis.git
cd coffee-type-diagnosis
pnpm install
pnpm dev
```

`http://localhost:5173/coffee-type-diagnosis/` が開発サーバーとして起動します。

## コマンド

| コマンド | 説明 |
| --- | --- |
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | 型チェック（`tsc -b`）と本番ビルド |
| `pnpm preview` | ビルド結果を本番相当のパスで確認 |
| `pnpm test` | Vitest をウォッチモードで実行（CI では `pnpm exec vitest run`） |
| `pnpm lint` | Biome による lint + format チェック |
| `pnpm format` | Biome によるフォーマット適用 |
| `pnpm storybook` | Storybook を起動（http://localhost:6006） |
| `pnpm build-storybook` | Storybook の静的ビルド |

## 診断の仕組み

1. **基本12問**: 4つの軸（酸味↔苦味 / 軽やか↔コク / フルーティ↔ナッティ / ブラック↔ミルク）を各3問で判定。各回答が担当軸に +1 / -1 を加点し、符号の組み合わせ（2⁴）で16タイプが決まる
2. **フレーバー深掘り3問**: フルーティ／ナッティの判定結果で質問が分岐。各回答が SCA フレーバーホイールの中分類に投票し、得票上位1〜2件があなたのフレーバーになる

診断ロジックは React に依存しない純粋関数（`src/logic/diagnose.ts`）で、質問・タイプはデータ（`src/data/`）として分離されているため、質問の追加やタイプの文言変更が容易です。

## ディレクトリ構成

```
src/
├── App.tsx             # 画面状態機械（start / quiz / result）
├── types.ts            # 共有型定義
├── data/
│   ├── questions.ts    # 基本12問 + フレーバー深掘り質問
│   └── results.ts      # 16タイプとフレーバー分類の定義
├── logic/diagnose.ts   # 診断の純粋関数（テスト対象）
├── storage/history.ts  # localStorage の履歴読み書き（テスト対象）
└── components/         # StartScreen / QuizScreen / ResultScreen / ResultCard
```

## 技術スタック

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- lint / format: [Biome](https://biomejs.dev/)
- テスト: [Vitest](https://vitest.dev/)（診断ロジックとストレージの純粋関数のみを対象）
- PNG 出力: [html-to-image](https://github.com/bubkoo/html-to-image)

## デプロイ

`main` ブランチへの push で GitHub Actions（`.github/workflows/deploy.yml`）が GitHub Pages へ自動デプロイします。CI（`.github/workflows/ci.yml`）では lint / テスト / ビルドを検証します。

初回のみ、リポジトリの Settings → Pages → Source を「GitHub Actions」に設定してください。

## 参考資料

- [SCA フレーバーホイール](https://sca.coffee/research/coffee-tasters-flavor-wheel)（SCAJ もこのホイールの利用を推奨しています）
- [UCC: スペシャルティコーヒーについて](https://www.ucc.co.jp/enjoy/brew/goodcofee_beans_06.html)
