import type { MyStamps } from "@/routes/_signed_in/my-page/-types/stamp";

/**
 * Storybook で使うスタンプ帳のデータ。字形と名前は生成済みの対応表と同じにする。
 * 並びはサーバーで並べ替えた後と同じ (画像スタンプ → よく使われる絵文字 → 対応表に無い絵文字)
 */
export const sampleStamps: MyStamps = {
    owned: [
        { shortCode: "!moripa_pink.png", type: "IMAGE", label: "moripa_pink" },
        {
            shortCode: ":sparkles:",
            type: "EMOJI",
            emoji: "✨",
            label: "きらきら",
        },
        {
            shortCode: ":cherry-blossom:",
            type: "EMOJI",
            emoji: "🌸",
            label: "桜",
        },
        {
            shortCode: ":four-leaf-clover:",
            type: "EMOJI",
            emoji: "🍀",
            label: "四つ葉のクローバー",
        },
        { shortCode: ":star:", type: "EMOJI", emoji: "⭐", label: "スター" },
        {
            shortCode: ":sunflower:",
            type: "EMOJI",
            emoji: "🌻",
            label: "ヒマワリ",
        },
        {
            shortCode: ":crescent-moon:",
            type: "EMOJI",
            emoji: "🌙",
            label: "三日月",
        },
        {
            shortCode: ":maple-leaf:",
            type: "EMOJI",
            emoji: "🍁",
            label: "かえで",
        },
        { shortCode: ":fish:", type: "EMOJI", emoji: "🐟", label: "魚" },
        { shortCode: ":pizza:", type: "EMOJI", emoji: "🍕", label: "ピザ" },
        {
            shortCode: ":fallen-leaf:",
            type: "EMOJI",
            emoji: "🍂",
            label: "落ち葉",
        },
        {
            shortCode: ":mushroom:",
            type: "EMOJI",
            emoji: "🍄",
            label: "キノコ",
        },
        {
            shortCode: ":1st-place-medal:",
            type: "EMOJI",
            emoji: "🥇",
            label: "金メダル",
        },
        {
            shortCode: ":evergreen-tree:",
            type: "EMOJI",
            emoji: "🌲",
            label: "常緑樹",
        },
        {
            shortCode: ":cricket-game:",
            type: "EMOJI",
            emoji: "🏏",
            label: "クリケット",
        },
        { shortCode: ":pick:", type: "EMOJI", emoji: "⛏️", label: "つるはし" },
        {
            shortCode: ":bridge-at-night:",
            type: "EMOJI",
            emoji: "🌉",
            label: "夜の橋",
        },
        {
            shortCode: ":last-track-button:",
            type: "EMOJI",
            emoji: "⏮️",
            label: "前の曲ボタン",
        },
        {
            shortCode: ":purple-circle:",
            type: "EMOJI",
            emoji: "🟣",
            label: "紫の丸",
        },
    ],
    total: 3405,
};

/** スタンプ帳のページで格子を何段も並べるためのデータ。肌の色つきや仮のタイルも混ぜる */
export const manySampleStamps: MyStamps = {
    owned: [
        { shortCode: "!moripa_pink.png", type: "IMAGE", label: "moripa_pink" },
        // 画像が無いスタンプは仮のタイルになる
        { shortCode: "!missing.png", type: "IMAGE", label: "missing" },
        {
            shortCode: ":face-with-tears-of-joy:",
            type: "EMOJI",
            emoji: "😂",
            label: "嬉し泣き",
        },
        {
            shortCode: ":red-heart:",
            type: "EMOJI",
            emoji: "❤️",
            label: "赤いハート",
        },
        {
            shortCode: ":smiling-face-with-heart-eyes:",
            type: "EMOJI",
            emoji: "😍",
            label: "目がハートの笑顔",
        },
        {
            shortCode: ":thumbs-up:",
            type: "EMOJI",
            emoji: "👍",
            label: "サムズアップ",
        },
        {
            shortCode: ":sparkles:",
            type: "EMOJI",
            emoji: "✨",
            label: "きらきら",
        },
        {
            shortCode: ":cherry-blossom:",
            type: "EMOJI",
            emoji: "🌸",
            label: "桜",
        },
        {
            shortCode: ":backhand-index-pointing-down:-medium-dark-skin-tone:",
            type: "EMOJI",
            emoji: "👇🏾",
            label: "下指差し: やや濃い肌色",
        },
        {
            shortCode: ":four-leaf-clover:",
            type: "EMOJI",
            emoji: "🍀",
            label: "四つ葉のクローバー",
        },
        { shortCode: ":star:", type: "EMOJI", emoji: "⭐", label: "スター" },
        { shortCode: ":rainbow:", type: "EMOJI", emoji: "🌈", label: "虹" },
        {
            shortCode: ":sunflower:",
            type: "EMOJI",
            emoji: "🌻",
            label: "ヒマワリ",
        },
        {
            shortCode: ":crescent-moon:",
            type: "EMOJI",
            emoji: "🌙",
            label: "三日月",
        },
        {
            shortCode: ":maple-leaf:",
            type: "EMOJI",
            emoji: "🍁",
            label: "かえで",
        },
        { shortCode: ":fish:", type: "EMOJI", emoji: "🐟", label: "魚" },
        {
            shortCode: ":cat-face:",
            type: "EMOJI",
            emoji: "🐱",
            label: "ネコの顔",
        },
        {
            shortCode: ":honeybee:",
            type: "EMOJI",
            emoji: "🐝",
            label: "ミツバチ",
        },
        { shortCode: ":pizza:", type: "EMOJI", emoji: "🍕", label: "ピザ" },
        {
            shortCode: ":fallen-leaf:",
            type: "EMOJI",
            emoji: "🍂",
            label: "落ち葉",
        },
        {
            shortCode: ":mushroom:",
            type: "EMOJI",
            emoji: "🍄",
            label: "キノコ",
        },
        {
            shortCode: ":1st-place-medal:",
            type: "EMOJI",
            emoji: "🥇",
            label: "金メダル",
        },
        {
            shortCode: ":evergreen-tree:",
            type: "EMOJI",
            emoji: "🌲",
            label: "常緑樹",
        },
        {
            shortCode: ":tropical-fish:",
            type: "EMOJI",
            emoji: "🐠",
            label: "熱帯魚",
        },
        {
            shortCode: ":house-with-garden:",
            type: "EMOJI",
            emoji: "🏡",
            label: "庭付きの家",
        },
        {
            shortCode: ":cricket-game:",
            type: "EMOJI",
            emoji: "🏏",
            label: "クリケット",
        },
        {
            shortCode: ":world-map:",
            type: "EMOJI",
            emoji: "🗺️",
            label: "世界地図",
        },
        { shortCode: ":pick:", type: "EMOJI", emoji: "⛏️", label: "つるはし" },
        {
            shortCode: ":camping:",
            type: "EMOJI",
            emoji: "🏕️",
            label: "キャンプ",
        },
        {
            shortCode: ":bridge-at-night:",
            type: "EMOJI",
            emoji: "🌉",
            label: "夜の橋",
        },
        {
            shortCode: ":last-track-button:",
            type: "EMOJI",
            emoji: "⏮️",
            label: "前の曲ボタン",
        },
        {
            shortCode: ":purple-circle:",
            type: "EMOJI",
            emoji: "🟣",
            label: "紫の丸",
        },
        // 対応表に無い絵文字は仮のタイルになり、いちばん後ろに並ぶ
        { shortCode: ":unknown-emoji:", type: "EMOJI", label: "unknown-emoji" },
    ],
    total: 3405,
};
