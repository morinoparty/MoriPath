import type { Decorator } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { css } from "../../../styled-system/css";

// 経路の地図は線路の形を squaremap のマーカーから引く (useQuery)。
// Storybook では取れないので、再試行せずにすぐあきらめ、駅どうしをまっすぐ結んだ線で見せる
const storyQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

/** 乗換案内のストーリー共通の枠。アプリの Layout と同じ幅と地の色にする */
export const withTransitFrame: Decorator = (Story) => (
    <QueryClientProvider client={storyQueryClient}>
        <div
            className={css({
                maxWidth: "md",
                margin: "0 auto",
                bg: "colorPalette.bg",
                color: "colorPalette.fg",
                textStyle: "body",
            })}
        >
            <Story />
        </div>
    </QueryClientProvider>
);

/** 部品のストーリー用の枠。ページの左右の余白を付ける */
export const withTransitPadding: Decorator = (Story) => (
    <div
        className={css({
            maxWidth: "md",
            margin: "0 auto",
            padding: "6",
            bg: "colorPalette.bg",
            color: "colorPalette.fg",
            textStyle: "body",
        })}
    >
        <Story />
    </div>
);

/** ページ全体のストーリーの parameters (sticky なボタンがあるので iframe に分けて表示する) */
export const transitPageParameters = {
    layout: "fullscreen",
    docs: { story: { inline: false, iframeHeight: 874 } },
} as const;
