import { useState } from "react";
import { sva } from "../../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../../components/sub-page-bar";
import { ShopDetailSheet } from "../../../../shop/-components/shop-detail-sheet";
import { ShopRow } from "../../../../shop/-components/shop-row";
import type { ShopListing } from "../../../../shop/-types/shop";

const myShopsViewStyle = sva({
    slots: ["root", "list", "message"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "5",
            minHeight: "100dvh",
            paddingX: "6",
            paddingTop: "4",
            paddingBottom:
                "max({spacing.6}, calc(env(safe-area-inset-bottom) + {spacing.2}))",
            bg: "colorPalette.bg",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "2",
            listStyle: "none",
        },
        message: {
            paddingY: "8",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
    },
});

export interface MyShopsViewProps {
    /** 自分のお店 (在庫のあるお店が先)。取得できなければ null */
    shops: ShopListing[] | null;
    /** 最初から詳細シートを開いておくお店 (Storybook 用) */
    defaultSelectedShop?: ShopListing;
}

/** 自分のお店の画面。おみせ画面と同じ行を並べ、押すと詳細シートを開く */
export const MyShopsView = ({
    shops,
    defaultSelectedShop,
}: MyShopsViewProps) => {
    const style = myShopsViewStyle();
    // 閉じるアニメーションのあいだも中身を残すため、選んだお店と開閉は別に持つ
    const [selectedShop, setSelectedShop] = useState<ShopListing | null>(
        defaultSelectedShop ?? null,
    );
    const [isSheetOpen, setIsSheetOpen] = useState(
        defaultSelectedShop !== undefined,
    );

    const openShop = (shop: ShopListing) => {
        setSelectedShop(shop);
        setIsSheetOpen(true);
    };

    return (
        <div className={style.root}>
            <SubPageBar title="自分のお店" backTo="/my-page" />
            {shops === null ? (
                <p className={style.message}>
                    お店の情報を読み込めませんでした
                </p>
            ) : shops.length === 0 ? (
                <p className={style.message}>お店はまだありません</p>
            ) : (
                <ul className={style.list}>
                    {shops.map((shop) => (
                        <li key={shop.id}>
                            <ShopRow
                                shop={shop}
                                onClick={() => openShop(shop)}
                            />
                        </li>
                    ))}
                </ul>
            )}
            <ShopDetailSheet
                shop={selectedShop}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </div>
    );
};
