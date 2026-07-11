import { RESULT_TYPES } from "../data/results";
import type { HistoryEntry } from "../types";

interface Props {
  history: HistoryEntry[];
  onStart: () => void;
  onSelect: (entry: HistoryEntry) => void;
  onShowTree: () => void;
}

export function StartScreen({ history, onStart, onSelect, onShowTree }: Props) {
  return (
    <div className="start">
      <p className="start-emoji">☕</p>
      <h1>コーヒータイプ診断</h1>
      <p className="start-lead">
        15の質問に答えると、あなた好みのコーヒーの品種・産地・フレーバー・飲み方がわかります。
        フレーバーは SCA
        フレーバーホイール（2016年版）のどの部分かでお伝えします。
      </p>
      <button type="button" className="primary-button" onClick={onStart}>
        診断をはじめる
      </button>
      <button type="button" className="text-button" onClick={onShowTree}>
        SCA フレーバーホイールを見る
      </button>
      {history.length > 0 && (
        <section className="history">
          <h2>診断履歴</h2>
          <ul>
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="history-item"
                  onClick={() => onSelect(entry)}
                >
                  <span className="history-name">
                    {RESULT_TYPES[entry.typeId]?.name}
                  </span>
                  <time dateTime={entry.diagnosedAt}>
                    {new Date(entry.diagnosedAt).toLocaleDateString("ja-JP")}
                  </time>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
