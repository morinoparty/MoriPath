import type { Meta, StoryObj } from "@storybook/react";
import { ClaimRow } from "@/routes/_signed_in/my-page/claims/-components/claim-row";
import { css } from "../../../styled-system/css";
import { sampleMyClaims } from "./sample-my-claims";

const meta: Meta<typeof ClaimRow> = {
    title: "MyPage/ClaimRow",
    component: ClaimRow,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div
                className={css({
                    maxWidth: "md",
                    padding: "6",
                    bg: "colorPalette.bg",
                    color: "colorPalette.fg",
                    textStyle: "body",
                })}
            >
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof ClaimRow>;

// 押すとオーバーワールドの地図で中心を開く
export const Default: Story = {
    args: { claim: sampleMyClaims.home },
};

export const Nether: Story = {
    args: { claim: sampleMyClaims.netherBase },
};

// /map で開けないワールドの土地は押せない行にする
export const UnknownWorld: Story = {
    args: { claim: sampleMyClaims.resource },
};
