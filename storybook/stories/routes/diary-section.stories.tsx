import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { DiarySection } from "@/routes/_signed_in/-components/diary-section";
import { css } from "../../styled-system/css";
import { sampleDiaryEntries } from "../sample-diary";
import { craftheadAvatarUrl } from "../sample-players";

const meta: Meta = {
    title: "Index/DiarySection",
    tags: ["autodocs"],
    parameters: {
        layout: "fullwidth",
    },
    decorators: [
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                <div
                    className={css({
                        bg: "colorPalette.bg",
                        paddingX: "6",
                        paddingY: "4",
                        maxWidth: "md",
                    })}
                >
                    <Story />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => (
        <DiarySection.Root>
            <DiarySection.Header />
            <DiarySection.Entries entries={sampleDiaryEntries} />
        </DiarySection.Root>
    ),
};

// まだ出来事が無い日
export const Empty: Story = {
    render: () => (
        <DiarySection.Root>
            <DiarySection.Header />
            <DiarySection.Entries entries={[]} />
        </DiarySection.Root>
    ),
};
