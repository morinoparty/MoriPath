import type { Meta, StoryObj } from "@storybook/react";
import { MyClaimsView } from "@/routes/_signed_in/my-page/claims/-components/my-claims-view";
import { css } from "../../../styled-system/css";
import { sampleMyClaimsPage } from "./sample-my-claims";

const meta: Meta<typeof MyClaimsView> = {
    title: "MyPage/MyClaimsView",
    component: MyClaimsView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [
        // アプリの Layout と同じ幅と地の色
        (Story) => (
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
        ),
    ],
    args: { data: sampleMyClaimsPage },
};

export default meta;

type Story = StoryObj<typeof MyClaimsView>;

export const Default: Story = {};

// まだ土地を保護していない
export const Empty: Story = {
    args: { data: { remainingClaimBlocks: 400, claims: [] } },
};

// MineAuth から取れなかったとき
export const LoadFailed: Story = {
    args: { data: null },
};

// loader を待っているあいだ (pendingComponent) のスケルトン
export const Loading: Story = {
    args: { data: null, loading: true },
};
