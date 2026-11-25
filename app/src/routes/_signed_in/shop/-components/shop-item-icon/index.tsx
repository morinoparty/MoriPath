import {
    MinecraftItem,
    useMinecraftConfig,
} from "@morinoparty/chlorophyll-react/components";
import { Package } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { css, cva } from "../../../../../../styled-system/css";
import { Skeleton } from "../../../../../components/skeleton";
import { itemRenderSlots } from "../../-functions/item-render-slots";

// 画面に入ったものだけを描く (先読みすると WebGL コンテキストの上限に早く届くため)
const VISIBLE_ROOT_MARGIN = "0px";

// 描き始めてもアイテムが出てこないとき (対応していない形など) に、スケルトンをやめるまでの時間
const PLACEHOLDER_TIMEOUT_MS = 5000;

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
        // アイテムが描かれたら (スケルトンのほかに中身ができたら) スケルトンを外す
        "& > [data-placeholder]:not(:only-child)": { display: "none" },
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

// タイルいっぱいの場所取り。角丸はタイルに合わせる
const placeholderStyle = css({ borderRadius: "inherit" });

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
    const isRendering = canRenderItem && (hasSlot || size === "lg");
    // MinecraftItem は読み込み中も対応していない形でも何も返さないため、
    // 描き始めてから一定時間でスケルトンをやめ、ずっと明滅し続けないようにする
    const [gaveUp, setGaveUp] = useState(false);
    // 画面から外れて描くのをやめたら、次に描くときに備えてスケルトンを戻す
    if (!isRendering && gaveUp) {
        setGaveUp(false);
    }
    useEffect(() => {
        if (!isRendering) {
            return;
        }
        const timer = setTimeout(() => setGaveUp(true), PLACEHOLDER_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [isRendering]);

    return (
        <div ref={ref} className={shopItemIconStyle({ size })} aria-hidden>
            {canRenderItem ? (
                <>
                    {isRendering && (
                        <MinecraftItem
                            id={itemId}
                            size={size === "lg" ? "md" : "sm"}
                        />
                    )}
                    {/* 画面に入るのを待つあいだも、描いている途中もスケルトンを出す */}
                    {!gaveUp && (
                        <Skeleton
                            variant="rect"
                            className={placeholderStyle}
                            data-placeholder=""
                        />
                    )}
                </>
            ) : (
                <Package className={fallbackIconStyle({ size })} />
            )}
        </div>
    );
};
