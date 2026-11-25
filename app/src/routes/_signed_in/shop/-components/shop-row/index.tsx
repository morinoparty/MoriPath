import { useMinecraftConfig } from "@morinoparty/chlorophyll-react/components";
import { Store } from "lucide-react";
import type { ComponentProps } from "react";
import { sva } from "../../../../../../styled-system/css";
import { isInStock } from "../../-functions/filter-shops";
import {
    formatPrice,
    itemWithAmount,
    stockLabel,
} from "../../-functions/format-shop";
import type { ShopListing } from "../../-types/shop";
import { ShopItemIcon } from "../shop-item-icon";

const shopRowStyle = sva({
    slots: [
        "root",
        "info",
        "itemName",
        "owner",
        "ownerHead",
        "ownerName",
        "price",
        "priceRow",
        "priceValue",
        "unit",
        "stock",
    ],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            gap: "3",
            width: "full",
            paddingY: "3",
            paddingLeft: "3",
            paddingRight: "4",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
            border: "none",
            color: "colorPalette.fg",
            textAlign: "start",
            lineHeight: "1.4",
            cursor: "pointer",
            transition: "background 0.15s",
            _hover: { bg: "colorPalette.surface.hover" },
            // 在庫の無いお店は一段沈める
            "&[data-sold-out]": { opacity: "0.55" },
        },
        info: {
            display: "flex",
            flex: "1",
            flexDirection: "column",
            gap: "0.5",
            minWidth: "0",
        },
        itemName: {
            fontSize: "15px",
            fontWeight: "bold",
            color: "colorPalette.fg",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        owner: {
            display: "flex",
            alignItems: "center",
            gap: "1.5",
            minWidth: "0",
        },
        // 顔画像 (またはお店のアイコン) を 16px の角丸の枠に収める
        ownerHead: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: "0",
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            overflow: "hidden",
            color: "colorPalette.fg.muted",
            "& > *": { width: "full", height: "full" },
            "& > img": { imageRendering: "pixelated" },
        },
        ownerName: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        price: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            flexShrink: "0",
            whiteSpace: "nowrap",
        },
        priceRow: {
            display: "flex",
            alignItems: "baseline",
            gap: "3px",
        },
        priceValue: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        unit: {
            fontSize: "11px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        stock: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
    },
});

/**
 * 持ち主の顔。PlayerAvatar の最小 (32px) より小さく出すため、
 * MinecraftProvider の avatarUrl から直接画像を引く。運営のお店は顔が無いのでお店のアイコンにする
 */
export const ShopOwnerHead = ({ owner }: { owner: ShopListing["owner"] }) => {
    const { avatarUrl } = useMinecraftConfig();
    if (!owner) {
        return <Store aria-hidden />;
    }
    // 名前を隣に文字で出しているため、画像は飾りとして読み上げない
    return <img src={avatarUrl(owner.id, 32)} alt="" loading="lazy" />;
};

/** 持ち主の表示名。運営のお店は「運営」 */
export const ownerDisplayName = (owner: ShopListing["owner"]): string =>
    owner?.name ?? "運営";

export interface ShopRowProps extends Omit<
    ComponentProps<"button">,
    "children"
> {
    shop: ShopListing;
}

/** お店一覧の 1 行。押すと詳細シートを開く (ボタンの props はシートの Trigger から受け取る) */
export const ShopRow = ({ shop, className, ...props }: ShopRowProps) => {
    const style = shopRowStyle();
    return (
        <button
            type="button"
            {...props}
            className={[style.root, className].filter(Boolean).join(" ")}
            data-sold-out={isInStock(shop) ? undefined : ""}
        >
            <ShopItemIcon itemId={shop.itemId} />
            <span className={style.info}>
                <span className={style.itemName}>{itemWithAmount(shop)}</span>
                <span className={style.owner}>
                    <span className={style.ownerHead}>
                        <ShopOwnerHead owner={shop.owner} />
                    </span>
                    <span className={style.ownerName}>
                        {ownerDisplayName(shop.owner)}
                    </span>
                </span>
            </span>
            <span className={style.price}>
                <span className={style.priceRow}>
                    <span className={style.priceValue}>
                        {formatPrice(shop.price)}
                    </span>
                    <span className={style.unit}>どんぐり</span>
                </span>
                <span className={style.stock}>{stockLabel(shop)}</span>
            </span>
        </button>
    );
};
