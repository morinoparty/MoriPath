import {
    MinecraftItem,
    useMinecraftConfig,
} from "@morinoparty/chlorophyll-react/components";
import { Package } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cva } from "../../../../../../styled-system/css";
import { itemRenderSlots } from "../../-functions/item-render-slots";

// 画面に入ったものだけを描く (先読みすると WebGL コンテキストの上限に早く届くため)
const VISIBLE_ROOT_MARGIN = "0px";

const shopItemIconStyle = cva({
    base: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: "0",
        overflow: "hidden",
        bg: "bg.panel",
        // MinecraftItem の大きさに合わせて置く場所を空けておき、読み込み前後で行の高さを変えない
        "& > *": { flexShrink: "0" },
    },
    variants: {
        size: {
            // 一覧の行: 48px の白いタイルに 32px のアイテム
            md: {
                width: "48px",
                height: "48px",
                borderRadius: "control",
            },
            // 詳細シート: 72px の淡いタイルに 48px のアイテム
            lg: {
                width: "72px",
                height: "72px",
                borderRadius: "panel",
                bg: "colorPalette.surface.subtle",
            },
        },
    },
    defaultVariants: { size: "md" },
});

const fallbackIconStyle = cva({
    base: { color: "colorPalette.fg.muted" },
    variants: {
        size: {
            md: { width: "20px", height: "20px" },
            lg: { width: "28px", height: "28px" },
        },
    },
});

export interface ShopItemIconProps {
    /** Minecraft のアイテム ID (小文字) */
    itemId: string;
    /** md = 一覧の行 / lg = 詳細シート */
    size?: "md" | "lg";
}

/**
 * お店のアイテムのタイル。
 * ブロックは 1 つずつ WebGL の Canvas で描かれ、ブラウザが同時に持てる数に限りがあるため、
 * 画面に入っていて、かつ同時に描く数の枠 (item-render-slots) を取れたあいだだけ MinecraftItem を置く
 */
export const ShopItemIcon = ({ itemId, size = "md" }: ShopItemIconProps) => {
    const ref = useRef<HTMLDivElement>(null);
    // 枠を見分けるための、このアイコン固有の印
    const [token] = useState(() => Symbol(itemId));
    // assets が設定されていない環境 (Storybook など) では MinecraftItem が投げるため、代わりのアイコンを出す
    const { resolveModel, resolveTexture } = useMinecraftConfig();
    const canRenderItem = Boolean(resolveModel && resolveTexture);

    useEffect(() => {
        const element = ref.current;
        // 詳細シートの大きなアイコンは枠を使わずに描く (上限はその 1 つ分を残してある)
        if (!element || !canRenderItem || size === "lg") {
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                // 画面に入ったら枠を求め、出たら返す
                if (entry?.isIntersecting) {
                    itemRenderSlots.request(token);
                } else {
                    itemRenderSlots.release(token);
                }
            },
            { rootMargin: VISIBLE_ROOT_MARGIN },
        );
        observer.observe(element);
        return () => {
            observer.disconnect();
            itemRenderSlots.release(token);
        };
    }, [canRenderItem, size, token]);
    const hasSlot = useSyncExternalStore(
        itemRenderSlots.subscribe,
        () => itemRenderSlots.has(token),
        // サーバーでは描かない (Canvas はクライアントでだけ作る)
        () => false,
    );

    return (
        <div ref={ref} className={shopItemIconStyle({ size })} aria-hidden>
            {canRenderItem ? (
                (hasSlot || size === "lg") && (
                    <MinecraftItem
                        id={itemId}
                        size={size === "lg" ? "md" : "sm"}
                    />
                )
            ) : (
                <Package className={fallbackIconStyle({ size })} />
            )}
        </div>
    );
};
