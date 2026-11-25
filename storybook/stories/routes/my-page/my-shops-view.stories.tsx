import type { Meta, StoryObj } from "@storybook/react";
import { MyShopsView } from "@/routes/_signed_in/my-page/shops/-components/my-shops-view";
import type { ShopListing } from "@/routes/_signed_in/shop/-types/shop";
import { sampleShops } from "../../sample-shops";
import { withShopProviders } from "../shop/shop-decorator";

// 在庫を数えられない (API が数を返さなかった) _NIKOMARU のお店
const stockUnknownShop: ShopListing = {
    ...sampleShops.diamond,
    id: 9,
    itemId: "emerald",
    itemName: "Emerald",
    amount: 4,
    price: 20,
    stock: null,
    stockUnknown: true,
};

// _NIKOMARU が持っているお店 (在庫のあるお店が先)
const myShops: ShopListing[] = [
    sampleShops.diamond,
    stockUnknownShop,
    sampleShops.namedFirework,
];

const meta: Meta<typeof MyShopsView> = {
    title: "MyPage/MyShopsView",
    component: MyShopsView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        // シートは position: fixed なので、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [withShopProviders],
    args: { shops: myShops },
};

export default meta;

type Story = StoryObj<typeof MyShopsView>;

export const Default: Story = {};

// 在庫の分からないお店の詳細シートを開いたところ
export const StockUnknownDetail: Story = {
    args: { defaultSelectedShop: stockUnknownShop },
};

// まだお店を持っていない
export const Empty: Story = {
    args: { shops: [] },
};

// MineAuth から取れなかったとき
export const LoadFailed: Story = {
    args: { shops: null },
};
