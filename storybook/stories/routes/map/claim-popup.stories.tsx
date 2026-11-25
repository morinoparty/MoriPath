import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { ClaimPopup } from "@/routes/_signed_in/map/-components/claim-popup";
import { css } from "../../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../../sample-players";

const meta: Meta<typeof ClaimPopup> = {
    title: "Map/ClaimPopup",
    component: ClaimPopup,
    tags: ["autodocs"],
    decorators: [
        // Storybook では MC_API_URL を使えないため crafthead.net から取得する
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                <div className={css({ p: "6", bg: "colorPalette.bg.subtle" })}>
                    <Story />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof ClaimPopup>;

export const Default: Story = {
    args: {
        claim: {
            isAdmin: false,
            owner: samplePlayers.nikomaru.name,
            permissionTrust: [samplePlayers.chocolatt.name],
            trust: [samplePlayers.kina1120.name, samplePlayers.hikighaL.name],
            containerTrust: [],
            accessTrust: [samplePlayers.tututututu201.name],
        },
    },
};

// 誰も信頼していない保護は持ち主だけを出す
export const OwnerOnly: Story = {
    args: {
        claim: {
            isAdmin: false,
            owner: samplePlayers.chocolatt.name,
            permissionTrust: [],
            trust: [],
            containerTrust: [],
            accessTrust: [],
        },
    },
};

// 運営の保護には持ち主がいない
export const Admin: Story = {
    args: {
        claim: {
            isAdmin: true,
            owner: "",
            permissionTrust: [],
            trust: [],
            containerTrust: [],
            accessTrust: [],
        },
    },
};
