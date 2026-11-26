import type { Meta, StoryObj } from "@storybook/react";
import { PhraseText } from "@/components/phrase-text";
import { css } from "../../styled-system/css";

const meta: Meta<typeof PhraseText> = {
    title: "Components/PhraseText",
    component: PhraseText,
    tags: ["autodocs"],
    args: {
        children:
            "_NIKOMARU さんと Chocolatt さんが森の奥で大きな桜の木を見つけて、みんなでお花見をしました。",
    },
    // 狭い幅で折り返し位置を確かめる
    decorators: [
        (Story) => (
            <div className={css({ width: "240px", textStyle: "md" })}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof PhraseText>;

export const Default: Story = {};

// 1 文節が行より長いときは、はみ出さずに折り返す
export const LongWord: Story = {
    args: {
        children:
            "tututututu201tututututu201tututututu201 さんがログインしました",
    },
};
