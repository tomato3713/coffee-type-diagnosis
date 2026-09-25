import { useEffect, useRef, useState } from "react";

const LANG = "ja-JP";

// Chrome はまだ webkit プレフィックス付きでしか提供していないことがある
function recognitionConstructor(): typeof SpeechRecognition | undefined {
  return globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;
}

export function isSpeechRecognitionSupported(): boolean {
  return recognitionConstructor() !== undefined;
}

// 端末内で音声認識できる環境ではそれを優先する。飲んだ感想とはいえ、
// 音声をわざわざ外部サーバーへ送る必要はないため。
// available() は新しい API なので、未実装ならクラウド認識にフォールバックする
async function canProcessLocally(
  ctor: typeof SpeechRecognition,
): Promise<boolean> {
  try {
    const status = await ctor.available({
      langs: [LANG],
      processLocally: true,
    });
    return status === "available";
  } catch {
    return false;
  }
}

// 確定した文字起こしは onFinal でその都度呼び出し側へ渡す。
// 呼び出し側は textarea で手修正できる状態を持つため、全文はここで持たない
export function useSpeechRecognition(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // start() 時点の onFinal を閉じ込めると、再レンダー後の最新の
  // 状態更新関数を呼べなくなるため ref 経由で参照する
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => () => recognitionRef.current?.abort(), []);

  async function start() {
    const ctor = recognitionConstructor();
    if (!ctor || recognitionRef.current) return;
    const recognition = new ctor();
    recognition.lang = LANG;
    recognition.continuous = true;
    recognition.interimResults = true;
    if (await canProcessLocally(ctor)) recognition.processLocally = true;

    recognition.onresult = (e) => {
      let pending = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) onFinalRef.current(result[0].transcript);
        else pending += result[0].transcript;
      }
      setInterim(pending);
    };
    recognition.onerror = (e) => {
      // no-speech は無音で自動終了しただけなので、エラーとしては見せない
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setError(e.error);
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return { listening, interim, error, start, stop };
}
