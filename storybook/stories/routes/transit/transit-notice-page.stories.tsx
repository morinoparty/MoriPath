import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { TransitNotice } from "@/routes/_signed_in/map/transit/-components/transit-notice";
import { TransitNoticePage } from "@/routes/_signed_in/map/transit/-components/transit-notice-page";
import { transitPageParameters, withTransitFrame } from "./transit-decorator";

const meta: Meta<typeof TransitNoticePage> = {
    title: "Transit/TransitNoticePage",
    component: TransitNoticePage,
    parameters: transitPageParameters,
    decorators: [withTransitFrame],
};

export default meta;

type Story = StoryObj<typeof TransitNoticePage>;

// 駅の一覧を読み込めなかったとき (route の errorComponent)。もう一度読み込める
export const NetworkError: Story = {
    args: {
        children: <TransitNotice kind="networkError" onRetry={fn()} />,
    },
};

// 鉄道の API を使えない
export const Unavailable: Story = {
    args: { children: <TransitNotice kind="unavailable" /> },
};
