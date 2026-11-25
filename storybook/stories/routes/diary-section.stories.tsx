import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { DiarySection } from "@/routes/_signed_in/-components/diary-section";
import { buildPlaceholderDiary } from "@/routes/_signed_in/-functions/build-placeholder-diary";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl } from "../sample-players";

// 表示が日によって変わらないよう日付を固定する
const sampleEntries = buildPlaceholderDiary(
    new Date("2026-11-25T12:00:00+09:00"),
);

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
            <DiarySection.Entries entries={sampleEntries} />
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
