import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TabBar } from "@/components/tab-bar";
import {
    ShopView,
    type ShopViewProps,
} from "@/routes/_signed_in/shop/-components/shop-view";
import type { ShopFilter } from "@/routes/_signed_in/shop/-types/shop";
import { css } from "../../../styled-system/css";
import { sampleSession } from "../../sample-players";
import { sampleShopList, sampleShops } from "../../sample-shops";
import { withShopProviders } from "./shop-decorator";

// 本物の画面では URL が持つ検索語とチップを、ストーリーの中で持つ
const ShopViewStory = (args: ShopViewProps) => {
    const [query, setQuery] = useState(args.query);
    const [filter, setFilter] = useState<ShopFilter>(args.filter);
    return (
        <ShopView
            {...args}
            query={query}
            filter={filter}
            onQueryChange={setQuery}
            onFilterChange={setFilter}
        />
    );
};

const meta: Meta<typeof ShopView> = {
    title: "Shop/ShopView",
    component: ShopView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        // TabBar とシートは position: fixed なので、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [
        (Story) => (
            // _signed_in レイアウトと同じく、浮いている TabBar の分だけ下を空ける
            <div
                className={css({
                    minHeight: "100vh",
                    paddingBottom: "calc(120px + env(safe-area-inset-bottom))",
                })}
            >
                <Story />
                <TabBar active="shop" />
            </div>
        ),
        withShopProviders,
    ],
    render: (args) => <ShopViewStory {...args} />,
    args: {
        session: sampleSession,
        shops: sampleShopList,
        query: "",
        filter: "all",
    },
};

export default meta;

type Story = StoryObj<typeof ShopView>;

export const Default: Story = {};

// 行を押したあと (Figma の /shop (詳細シート))
export const WithDetailSheet: Story = {
    args: { defaultSelectedShop: sampleShops.diamond },
};

// 「買い取り」で絞り込んだところ
export const BuyingOnly: Story = {
    args: { filter: "buy" },
};

// 見つからなかったとき
export const NoResults: Story = {
    args: { query: "netherite" },
};

// 一覧を取得できなかったとき
export const LoadError: Story = {
    args: { shops: null },
};
