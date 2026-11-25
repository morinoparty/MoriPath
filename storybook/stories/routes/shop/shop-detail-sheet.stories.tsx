import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
    ShopDetailSheet,
    type ShopDetailSheetProps,
} from "@/routes/_signed_in/shop/-components/shop-detail-sheet";
import { css } from "../../../styled-system/css";
import { sampleShops } from "../../sample-shops";
import { withShopProviders } from "./shop-decorator";

// 閉じたあともボタンから開き直せるよう、開閉をストーリーの中で持つ
const ShopDetailSheetStory = (args: ShopDetailSheetProps) => {
    const [open, setOpen] = useState(args.open);
    return (
        <>
            <button
                type="button"
                className={css({ margin: "6", cursor: "pointer" })}
                onClick={() => setOpen(true)}
            >
                シートを開く
            </button>
            <ShopDetailSheet {...args} open={open} onOpenChange={setOpen} />
        </>
    );
};

const meta: Meta<typeof ShopDetailSheet> = {
    title: "Shop/ShopDetailSheet",
    component: ShopDetailSheet,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        // シートは position: fixed なので、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [
        (Story) => (
            <div className={css({ minHeight: "100vh" })}>
                <Story />
            </div>
        ),
        withShopProviders,
    ],
    render: (args) => <ShopDetailSheetStory {...args} />,
};

export default meta;

type Story = StoryObj<typeof ShopDetailSheet>;

// Figma の /shop (詳細シート) と同じお店
export const Default: Story = {
    args: { shop: sampleShops.diamond, open: true },
};

// 買い取りのお店
export const Buying: Story = {
    args: { shop: sampleShops.ironIngot, open: true },
};

// 運営の無限ショップ (持ち主なし・在庫無限)
export const AdminShop: Story = {
    args: { shop: sampleShops.minecart, open: true },
};

// ネザーにある、名前の付いたアイテム
export const NamedItemInNether: Story = {
    args: { shop: sampleShops.namedFirework, open: true },
};
