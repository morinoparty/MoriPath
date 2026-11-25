// MineStamp の emoji.properties から、スタンプの shortCode → 絵文字の対応表を生成する
// 使い方: pnpm --filter @moripath/app generate:stamp-emoji [emoji.properties のパス]
// パスを省略すると GitHub 上の MineStamp (master) から取得する
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const DEFAULT_SOURCE_URL =
    "https://raw.githubusercontent.com/morinoparty/MineStamp/master/src/main/resources/emoji.properties";
const OUTPUT_PATH = new URL(
    "../src/routes/_signed_in/my-page/-functions/stamp-emoji.gen.json",
    import.meta.url,
);
// 異体字セレクタ (絵文字表示の指定)。有無の違いだけなら同じ絵文字として扱う
const VARIATION_SELECTOR = "FE0F";

/** .properties は ISO-8859-1 で書かれているため latin1 として読む */
const readSource = async (source) => {
    if (source) {
        return (await readFile(source)).toString("latin1");
    }
    const response = await fetch(DEFAULT_SOURCE_URL);
    if (!response.ok) {
        throw new Error(
            `emoji.properties を取得できません: ${response.status}`,
        );
    }
    return new TextDecoder("latin1").decode(await response.arrayBuffer());
};

/** Java の .properties のエスケープ (\uXXXX, \:, \! など) を戻す */
const unescapeProperty = (text) =>
    text.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_, escaped) => {
        if (escaped.length === 5) {
            return String.fromCharCode(Number.parseInt(escaped.slice(1), 16));
        }
        return { t: "\t", n: "\n", r: "\r", f: "\f" }[escaped] ?? escaped;
    });

/** 1 行 1 項目の .properties を [キー, 値] の配列にする (MineStamp の形式だけを想定) */
const parseProperties = (text) =>
    text
        .split(/\r?\n/)
        .map((line) => line.trim())
        // 空行とコメント行は飛ばす
        .filter(
            (line) => line && !line.startsWith("#") && !line.startsWith("!"),
        )
        .map((line) => {
            // エスケープされていない最初の = か : が区切り
            const match = /^((?:\\.|[^\\=:])*)[=:](.*)$/.exec(line);
            if (!match) {
                throw new Error(`解釈できない行です: ${line}`);
            }
            return [unescapeProperty(match[1]), match[2].trim()];
        });

/** emojibase の hexcode (異体字セレクタを除く) → 完全修飾の絵文字 */
const buildEmojibaseIndex = () => {
    const data = require("emojibase-data/en/data.json");
    const index = new Map();
    const add = (emoji) => {
        index.set(stripVariationSelector(emoji.hexcode), emoji.emoji);
        for (const skin of emoji.skins ?? []) {
            add(skin);
        }
    };
    for (const emoji of data) {
        add(emoji);
    }
    return index;
};

const stripVariationSelector = (hexcode) =>
    hexcode
        .split("-")
        .filter((code) => code !== VARIATION_SELECTOR)
        .join("-");

const toGlyph = (codePoints) =>
    String.fromCodePoint(
        ...codePoints.map((code) => Number.parseInt(code, 16)),
    );

const main = async () => {
    const entries = parseProperties(await readSource(process.argv[2]));
    const emojibase = buildEmojibaseIndex();
    const map = {};
    let qualified = 0;
    let unresolved = 0;
    for (const [shortCode, value] of entries) {
        const codePoints = value.split(/\s+/).filter(Boolean);
        if (codePoints.length === 0) {
            unresolved += 1;
            continue;
        }
        const own = toGlyph(codePoints);
        // MineStamp の値は FE0F を省いたものがあり、ブラウザによっては白黒の文字で描かれる
        // emojibase に同じ絵文字があれば、FE0F 付きの完全修飾の形を使う
        const fromEmojibase = emojibase.get(
            stripVariationSelector(codePoints.join("-").toUpperCase()),
        );
        if (fromEmojibase && fromEmojibase !== own) {
            qualified += 1;
        }
        map[shortCode] = fromEmojibase ?? own;
    }
    // 差分が読みやすいよう shortCode 順に並べる
    const sorted = Object.fromEntries(
        Object.entries(map).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
    await writeFile(OUTPUT_PATH, `${JSON.stringify(sorted, null, 4)}\n`);
    console.info(
        `${Object.keys(sorted).length} 件を書き出しました (emojibase で完全修飾: ${qualified} 件, 値なし: ${unresolved} 件)`,
    );
};

await main();
