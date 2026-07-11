// タッチのみでホバー操作ができない端末（スマホ等）かどうかを判定する
export function isTouchDevice(): boolean {
  return matchMedia("(hover: none) and (pointer: coarse)").matches;
}
