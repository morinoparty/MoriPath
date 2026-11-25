import {
    MinecraftItem,
    useMinecraftConfig,
} from "@morinoparty/chlorophyll-react/components";
import { Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cva } from "../../../../../../styled-system/css";

// 画面の外にあるアイコンも、少し手前から用意しておく
const VISIBLE_ROOT_MARGIN = "200px 0px";

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
 * 画面の近くにあるあいだだけ MinecraftItem を置く
 */
export const ShopItemIcon = ({ itemId, size = "md" }: ShopItemIconProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isNearViewport, setIsNearViewport] = useState(false);
    // assets が設定されていない環境 (Storybook など) では MinecraftItem が投げるため、代わりのアイコンを出す
    const { resolveModel, resolveTexture } = useMinecraftConfig();
    const canRenderItem = Boolean(resolveModel && resolveTexture);

    useEffect(() => {
        const element = ref.current;
        if (!element || !canRenderItem) {
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => setIsNearViewport(entry?.isIntersecting ?? false),
            { rootMargin: VISIBLE_ROOT_MARGIN },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [canRenderItem]);

    return (
        <div ref={ref} className={shopItemIconStyle({ size })} aria-hidden>
            {canRenderItem ? (
                isNearViewport && (
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
