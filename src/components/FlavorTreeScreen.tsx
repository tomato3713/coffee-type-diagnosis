import { findFlavorCategory } from "../data/results";
import type { FlavorCategoryId } from "../types";
import { FlavorTreeView } from "./FlavorTreeView";

interface Props {
  highlightIds: FlavorCategoryId[];
  onBack: () => void;
  backLabel: string;
}

export function FlavorTreeScreen({ highlightIds, onBack, backLabel }: Props) {
  return (
    <div className="flavor-tree-screen">
      <h1>SCA フレーバーホイール</h1>
      {highlightIds.length > 0 ? (
        <p className="flavor-tree-lead">
          あなたの好みのフレーバー（
          {highlightIds.map((id) => findFlavorCategory(id).label).join("・")}
          ）のラインを強調表示しています。
        </p>
      ) : (
        <p className="flavor-tree-lead">
          SCA フレーバーホイール（2016年版）の香味表現をツリーで表示しています。
          ドラッグで移動、ホイールやピンチで拡大・縮小できます。
        </p>
      )}
      <FlavorTreeView highlightIds={highlightIds} />
      <button type="button" className="text-button" onClick={onBack}>
        {backLabel}
      </button>
    </div>
  );
}
