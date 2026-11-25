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
