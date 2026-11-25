import type { MyStamps } from "@/routes/_signed_in/my-page/-types/stamp";

/** Storybook で使うスタンプ帳のデータ。字形は生成済みの対応表と同じ完全修飾の形にする */
export const sampleStamps: MyStamps = {
    owned: [
        { shortCode: ":1st-place-medal:", type: "EMOJI", emoji: "🥇" },
        { shortCode: ":cherry-blossom:", type: "EMOJI", emoji: "🌸" },
        { shortCode: ":pizza:", type: "EMOJI", emoji: "🍕" },
        { shortCode: ":last-track-button:", type: "EMOJI", emoji: "⏮️" },
        { shortCode: ":evergreen-tree:", type: "EMOJI", emoji: "🌲" },
        { shortCode: ":sparkles:", type: "EMOJI", emoji: "✨" },
        { shortCode: ":bridge-at-night:", type: "EMOJI", emoji: "🌉" },
        { shortCode: ":purple-circle:", type: "EMOJI", emoji: "🟣" },
        { shortCode: ":cricket-game:", type: "EMOJI", emoji: "🏏" },
        { shortCode: "!moripa_pink.png", type: "IMAGE" },
    ],
    total: 3405,
};

/** スタンプ帳のページで格子を何段も並べるためのデータ。長い名前や仮のタイルも混ぜる */
export const manySampleStamps: MyStamps = {
    owned: [
        ...sampleStamps.owned,
        { shortCode: ":fallen-leaf:", type: "EMOJI", emoji: "🍂" },
        { shortCode: ":maple-leaf:", type: "EMOJI", emoji: "🍁" },
        { shortCode: ":mushroom:", type: "EMOJI", emoji: "🍄" },
        { shortCode: ":fish:", type: "EMOJI", emoji: "🐟" },
        { shortCode: ":tropical-fish:", type: "EMOJI", emoji: "🐠" },
        { shortCode: ":four-leaf-clover:", type: "EMOJI", emoji: "🍀" },
        { shortCode: ":sunflower:", type: "EMOJI", emoji: "🌻" },
        { shortCode: ":pick:", type: "EMOJI", emoji: "⛏️" },
        { shortCode: ":house-with-garden:", type: "EMOJI", emoji: "🏡" },
        { shortCode: ":crescent-moon:", type: "EMOJI", emoji: "🌙" },
        { shortCode: ":star:", type: "EMOJI", emoji: "⭐" },
        { shortCode: ":rainbow:", type: "EMOJI", emoji: "🌈" },
        { shortCode: ":cat-face:", type: "EMOJI", emoji: "🐱" },
        { shortCode: ":honeybee:", type: "EMOJI", emoji: "🐝" },
        { shortCode: ":camping:", type: "EMOJI", emoji: "🏕️" },
        { shortCode: ":world-map:", type: "EMOJI", emoji: "🗺️" },
        {
            shortCode: ":backhand-index-pointing-down:-medium-dark-skin-tone:",
            type: "EMOJI",
            emoji: "👇🏾",
        },
        // 画像が無いスタンプと、対応表に無い絵文字は仮のタイルになる
        { shortCode: "!missing.png", type: "IMAGE" },
        { shortCode: ":unknown-emoji:", type: "EMOJI" },
    ],
    total: 3405,
};
