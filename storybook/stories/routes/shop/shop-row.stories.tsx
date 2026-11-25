import type { Meta, StoryObj } from "@storybook/react";
import {
    ShopRow,
    ShopRowSkeleton,
} from "@/routes/_signed_in/shop/-components/shop-row";
import { css } from "../../../styled-system/css";
import { sampleShopList, sampleShops } from "../../sample-shops";
import { withShopProviders } from "./shop-decorator";

const meta: Meta<typeof ShopRow> = {
    title: "Shop/ShopRow",
    component: ShopRow,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className={css({ padding: "6" })}>
                <Story />
            </div>
        ),
        withShopProviders,
    ],
};

export default meta;

type Story = StoryObj<typeof ShopRow>;

export const Default: Story = {
    args: { shop: sampleShops.cobblestone },
};

// 在庫が無いお店は行ごと薄くなる
export const SoldOut: Story = {
    args: { shop: sampleShops.bread },
};

// 買い取りのお店は「買い取り枠」で数える
export const Buying: Story = {
    args: { shop: sampleShops.ironIngot },
};

// 運営の無限ショップは持ち主の代わりに「運営」と出す
export const AdminShop: Story = {
    args: { shop: sampleShops.minecart },
};

// 在庫の数が分からないお店は、無限 (∞) と見分けるため「—」と出す
export const StockUnknown: Story = {
    args: {
        shop: { ...sampleShops.oakLog, stock: null, stockUnknown: true },
    },
};

// Figma の /shop と同じ並び
export const List: Story = {
    render: () => (
        <ul
            className={css({
                display: "flex",
                flexDirection: "column",
                gap: "2",
                listStyle: "none",
            })}
        >
            {sampleShopList.map((shop) => (
                <li key={shop.id}>
                    <ShopRow shop={shop} />
                </li>
            ))}
        </ul>
    ),
};

// 読み込み中の行。本物の行と高さがそろっていることを並べて確かめる
export const Skeleton: Story = {
    render: () => (
        <ul
            className={css({
                display: "flex",
                flexDirection: "column",
                gap: "2",
                listStyle: "none",
            })}
        >
            <li>
                <ShopRow shop={sampleShops.cobblestone} />
            </li>
            <li>
                <ShopRowSkeleton />
            </li>
            <li>
                <ShopRowSkeleton />
            </li>
        </ul>
    ),
};
