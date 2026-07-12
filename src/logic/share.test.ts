import { describe, expect, it } from "vitest";
import { FLAVOR_QUESTIONS } from "../data/questions";
import {
  FLAVOR_CATEGORIES,
  PROCESS_METHODS,
  RESULT_TYPES,
  ROAST_LEVELS,
} from "../data/results";
import {
  buildResultHash,
  buildShareText,
  buildShareUrl,
  buildWheelHash,
  decodeShareQuery,
  encodeShareQuery,
  lineShareUrl,
  mixiShareUrl,
  parseHashRoute,
  RESULT_PATH,
  type SharedResult,
  WHEEL_PATH,
  xIntentUrl,
} from "./share";

const sample: SharedResult = {
  typeId: "acid-light-fruity-straight",
  roast: 2,
  process: "washed",
  flavorIds: ["floral", "berry"],
};

describe("encodeShareQuery / decodeShareQuery", () => {
  it("エンコードした文字列をデコードすると元の値に戻る", () => {
    expect(decodeShareQuery(encodeShareQuery(sample))).toEqual(sample);
  });

  it("全16タイプの id がラウンドトリップできる", () => {
    for (const typeId of Object.keys(RESULT_TYPES)) {
      const result: SharedResult = {
        typeId,
        roast: 5,
        process: "natural",
        flavorIds: ["burnt"],
      };
      expect(decodeShareQuery(encodeShareQuery(result))).toEqual(result);
    }
  });

  it("全8段階の焙煎度と全7種の精製方法がラウンドトリップできる", () => {
    for (const level of ROAST_LEVELS) {
      const result: SharedResult = { ...sample, roast: level.level };
      expect(decodeShareQuery(encodeShareQuery(result))).toEqual(result);
    }
    for (const process of Object.keys(
      PROCESS_METHODS,
    ) as SharedResult["process"][]) {
      const result: SharedResult = { ...sample, process };
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
    expect(decodeShareQuery("t=no-such-type&r=2&p=washed&f=floral")).toBeNull();
  });

  it("未知の flavorId が含まれると null になる", () => {
    expect(
      decodeShareQuery(
        "t=acid-light-fruity-straight&r=2&p=washed&f=floral,unknown",
      ),
    ).toBeNull();
  });

  it("範囲外の焙煎度や未知の精製方法は null になる", () => {
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&r=0&p=washed&f=floral"),
    ).toBeNull();
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&r=9&p=washed&f=floral"),
    ).toBeNull();
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&r=abc&p=washed&f=floral"),
    ).toBeNull();
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&r=2&p=unknown&f=floral"),
    ).toBeNull();
  });

  it("t・r・p・f のいずれかが欠落すると null になる", () => {
    expect(decodeShareQuery("r=2&p=washed&f=floral")).toBeNull();
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&p=washed&f=floral"),
    ).toBeNull();
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&r=2&f=floral"),
    ).toBeNull();
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&r=2&p=washed"),
    ).toBeNull();
    expect(
      decodeShareQuery("t=acid-light-fruity-straight&r=2&p=washed&f="),
    ).toBeNull();
    expect(decodeShareQuery("")).toBeNull();
  });

  // フレーバー深掘り質問数が最も多い分岐（質問数）が上限になる
  const maxFlavorIds = Math.max(
    ...Object.values(FLAVOR_QUESTIONS).map((questions) => questions.length),
  );

  it("flavorId が質問数の上限までなら受理される", () => {
    const flavorIds = FLAVOR_CATEGORIES.slice(0, maxFlavorIds).map((c) => c.id);
    const result: SharedResult = { ...sample, flavorIds };
    expect(decodeShareQuery(encodeShareQuery(result))).toEqual(result);
  });

  it("flavorId が質問数の上限を超える、または重複していると null になる", () => {
    const tooMany = FLAVOR_CATEGORIES.slice(0, maxFlavorIds + 1).map(
      (c) => c.id,
    );
    expect(
      decodeShareQuery(
        `t=acid-light-fruity-straight&r=2&p=washed&f=${tooMany.join(",")}`,
      ),
    ).toBeNull();
    expect(
      decodeShareQuery(
        "t=acid-light-fruity-straight&r=2&p=washed&f=floral,floral",
      ),
    ).toBeNull();
  });
});

describe("parseHashRoute", () => {
  it("空文字列は空の path と query になる", () => {
    expect(parseHashRoute("")).toEqual({ path: "", query: "" });
  });

  it("クエリなしのハッシュパスを分解できる", () => {
    expect(parseHashRoute("#/wheel")).toEqual({ path: "/wheel", query: "" });
  });

  it("先頭の # がなくても分解できる", () => {
    expect(parseHashRoute("/wheel")).toEqual({ path: "/wheel", query: "" });
  });

  it("クエリ付きのハッシュパスを path と query に分解する", () => {
    expect(parseHashRoute("#/result?t=a&f=b,c")).toEqual({
      path: "/result",
      query: "t=a&f=b,c",
    });
  });
});

describe("buildResultHash / buildWheelHash", () => {
  it("buildResultHash は /result パスにエンコード済みクエリを付ける", () => {
    const { path, query } = parseHashRoute(buildResultHash(sample));
    expect(path).toBe(RESULT_PATH);
    expect(decodeShareQuery(query)).toEqual(sample);
  });

  it("buildWheelHash は結果を渡すと /wheel パスにクエリを付ける", () => {
    const { path, query } = parseHashRoute(buildWheelHash(sample));
    expect(path).toBe(WHEEL_PATH);
    expect(decodeShareQuery(query)).toEqual(sample);
  });

  it("buildWheelHash は null を渡すとクエリなしの /wheel になる", () => {
    expect(buildWheelHash(null)).toBe(`#${WHEEL_PATH}`);
  });
});

describe("シェア URL とシェア文言", () => {
  it("buildShareUrl はベース URL にハッシュパス形式のクエリを連結する", () => {
    const url = new URL(buildShareUrl("https://example.com/app/", sample));
    const { path, query } = parseHashRoute(url.hash);
    expect(path).toBe(RESULT_PATH);
    expect(decodeShareQuery(query)).toEqual(sample);
  });

  it("buildShareText はタイプ名とハッシュタグと url を含む", () => {
    const text = buildShareText(
      "華やかシングルオリジン型",
      "https://example.com/?t=a&f=b",
    );
    expect(text).toContain("「華やかシングルオリジン型」");
    expect(text).toContain("#コーヒータイプ診断");
    expect(text).toContain("https://example.com/?t=a&f=b");
  });

  it("xIntentUrl は日本語と # と url を含む text をエンコードして保持する", () => {
    const text = buildShareText(
      "華やかシングルオリジン型",
      "https://example.com/?t=a&f=b",
    );
    const url = new URL(xIntentUrl(text));
    expect(url.origin + url.pathname).toBe("https://x.com/intent/post");
    expect(url.searchParams.get("text")).toBe(text);
    // text に url を含めているため、別途 url パラメータは付けない（二重表示防止）
    expect(url.searchParams.has("url")).toBe(false);
  });

  it("lineShareUrl は text（url を含む）をメッセージ共有 URL scheme に載せる", () => {
    const text = buildShareText(
      "華やかシングルオリジン型",
      "https://example.com/?t=a&f=b,c",
    );
    const url = new URL(lineShareUrl(text));
    expect(url.origin + url.pathname).toBe("https://line.me/R/share");
    expect(url.searchParams.get("text")).toBe(text);
  });

  it("mixiShareUrl はシェア先 URL を保持する", () => {
    const url = new URL(mixiShareUrl("https://example.com/?t=a&f=b,c"));
    expect(url.origin + url.pathname).toBe("https://mixi.jp/share.pl");
    expect(url.searchParams.get("u")).toBe("https://example.com/?t=a&f=b,c");
  });
});
