import type { Meta, StoryObj } from "@storybook/react";
import { DiarySectionHeader } from "@/routes/_signed_in/diary/-components/diary-section-header";
import { withDiaryFrame } from "./diary-decorator";

const meta: Meta<typeof DiarySectionHeader> = {
    title: "Diary/DiarySectionHeader",
    component: DiarySectionHeader,
    tags: ["autodocs"],
    decorators: [withDiaryFrame],
    args: {
        group: {
            id: "morning",
            label: "朝",
            from: 4,
            until: 10,
            caption: "しずかな森の目覚め",
        },
    },
};

export default meta;

type Story = StoryObj<typeof DiarySectionHeader>;

export const Morning: Story = {};

export const Daytime: Story = {
    args: {
        group: {
            id: "daytime",
            label: "昼",
            from: 10,
            until: 16,
            caption: "にぎやかな森のひととき",
        },
    },
};

export const Evening: Story = {
    args: {
        group: {
            id: "evening",
            label: "夕方",
            from: 16,
            until: 19,
            caption: "森が茜色に染まるころ",
        },
    },
};

// 日をまたぐ時間帯。終わりは翌 4 時として出す
export const Night: Story = {
    args: {
        group: {
            id: "night",
            label: "夜",
            from: 19,
            until: 28,
            caption: "星あかりの森",
        },
    },
};
