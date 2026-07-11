import { describe, expect, it } from "vitest";
import { RESULT_TYPES } from "../data/results";
import {
  buildShareText,
  buildShareUrl,
  decodeShareQuery,
  encodeShareQuery,
  lineShareUrl,
  mixiShareUrl,
  type SharedResult,
  xIntentUrl,
} from "./share";

const sample: SharedResult = {
  typeId: "acid-light-fruity-straight",
  flavorIds: ["floral", "berry"],
};

describe("encodeShareQuery / decodeShareQuery", () => {
  it("エンコードした文字列をデコードすると元の値に戻る", () => {
    expect(decodeShareQuery(encodeShareQuery(sample))).toEqual(sample);
  });

  it("全16タイプの id がラウンドトリップできる", () => {
    for (const typeId of Object.keys(RESULT_TYPES)) {
      const result: SharedResult = { typeId, flavorIds: ["roast"] };
      expect(decodeShareQuery(encodeShareQuery(result))).toEqual(result);
    }
  });

  it("先頭に ? が付いた search 文字列もデコードできる", () => {
    expect(decodeShareQuery(`?${encodeShareQuery(sample)}`)).toEqual(sample);
  });

  it("無関係なクエリパラメータは無視される", () => {
    expect(
      decodeShareQuery(`utm_source=x&${encodeShareQuery(sample)}`),
    ).toEqual(sample);
  });

  it("未知の typeId は null になる", () => {
    expect(decodeShareQuery("t=no-such-type&f=floral")).toBeNull();
  });

  it("未知の flavorId が含まれると null になる", () => {
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&f=floral,unknown"),
    ).toBeNull();
  });

  it("t や f が欠落すると null になる", () => {
    expect(decodeShareQuery("f=floral")).toBeNull();
    expect(decodeShareQuery("t=acid-light-fruity-straight")).toBeNull();
    expect(decodeShareQuery("t=acid-light-fruity-straight&f=")).toBeNull();
    expect(decodeShareQuery("")).toBeNull();
  });

  it("flavorId が3個以上または重複していると null になる", () => {
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&f=floral,berry,citrus"),
    ).toBeNull();
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&f=floral,floral"),
    ).toBeNull();
  });
});

describe("シェア URL とシェア文言", () => {
  it("buildShareUrl はベース URL にクエリを連結する", () => {
    const url = new URL(buildShareUrl("https://example.com/app/", sample));
    expect(url.searchParams.get("t")).toBe(sample.typeId);
    expect(url.searchParams.get("f")).toBe("floral,berry");
  });

  it("buildShareText はタイプ名とハッシュタグを含む", () => {
    const text = buildShareText("華やかシングルオリジン型");
    expect(text).toContain("「華やかシングルオリジン型」");
    expect(text).toContain("#コーヒータイプ診断");
  });

  it("xIntentUrl は日本語と # を含む text をエンコードして保持する", () => {
    const text = buildShareText("華やかシングルオリジン型");
    const url = new URL(xIntentUrl(text, "https://example.com/?t=a&f=b"));
    expect(url.origin + url.pathname).toBe("https://x.com/intent/post");
    expect(url.searchParams.get("text")).toBe(text);
    expect(url.searchParams.get("url")).toBe("https://example.com/?t=a&f=b");
  });

  it("lineShareUrl はシェア先 URL を保持する", () => {
    const url = new URL(lineShareUrl("https://example.com/?t=a&f=b,c"));
    expect(url.origin + url.pathname).toBe(
      "https://social-plugins.line.me/lineit/share",
    );
    expect(url.searchParams.get("url")).toBe("https://example.com/?t=a&f=b,c");
  });

  it("mixiShareUrl はシェア先 URL を保持する", () => {
    const url = new URL(mixiShareUrl("https://example.com/?t=a&f=b,c"));
    expect(url.origin + url.pathname).toBe("https://mixi.jp/share.pl");
    expect(url.searchParams.get("u")).toBe("https://example.com/?t=a&f=b,c");
  });
});
