import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { Button } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import { worldLabels } from "../../../map/-functions/world-labels";
import {
    formatCoordinates,
    formatPrice,
    itemWithAmount,
    shopModeLabels,
    stockHeading,
} from "../../-functions/format-shop";
import type { ShopListing } from "../../-types/shop";
import { ShopItemIcon } from "../shop-item-icon";
import { ownerDisplayName, ShopOwnerHead } from "../shop-row";

const shopDetailSheetStyle = sva({
    slots: [
        "backdrop",
        "positioner",
        "content",
        "handle",
        "head",
        "heading",
        "title",
        "mode",
        "facts",
        "fact",
        "factLabel",
        "factValue",
        "factNumber",
        "factUnit",
        "rows",
        "row",
        "rowHead",
        "rowIcon",
        "rowText",
        "rowMeta",
        "action",
    ],
    base: {
        // 画面の地の色を薄く敷いて、後ろの一覧を沈める
        backdrop: {
            position: "fixed",
            inset: "0",
            zIndex: "overlay",
            bg: "colorPalette.fg/32",
            _open: {
                animationName: "drawerFadeIn",
                animationDuration: "normal",
                animationTimingFunction: "easeOut",
            },
            // 閉じるアニメーションの終わりで Ark UI が DOM を外す
            _closed: {
                animationName: "modalDialogFadeOut",
                animationDuration: "fast",
                animationTimingFunction: "easeIn",
            },
        },
        // シートを画面下の中央に寄せるだけのレイヤー。シートの外のクリックは暗幕へ通す
        positioner: {
            position: "fixed",
            inset: "0",
            zIndex: "modal",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pointerEvents: "none",
        },
        content: {
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "5",
            width: "full",
            // アプリの本文と同じ幅に収める
            maxWidth: "md",
            maxHeight: "85dvh",
            overflowY: "auto",
            overscrollBehavior: "contain",
            paddingX: "6",
            paddingTop: "3",
            // ホームインジケーターのある端末では、その分だけ下を空ける
            paddingBottom:
                "max(token(spacing.10), env(safe-area-inset-bottom))",
            bg: "bg.panel",
            borderTopRadius: "28px",
            boxShadow: "floating",
            outline: "none",
            color: "colorPalette.fg",
            lineHeight: "1.4",
            _open: {
                animationName: "sheetSlideUp",
                animationDuration: "normal",
                animationTimingFunction: "emphasizedDecelerate",
            },
            _closed: {
                animationName: "sheetSlideDown",
                animationDuration: "fast",
                animationTimingFunction: "emphasizedAccelerate",
            },
            // 動きを減らす設定では、滑らせずにその場でフェードさせる
            _motionReduce: {
                _open: { animationName: "drawerFadeIn" },
                _closed: { animationName: "modalDialogFadeOut" },
            },
        },
        // 下から引き出したシートであることを示す取っ手 (操作はできない飾り)
        handle: {
            alignSelf: "center",
            flexShrink: "0",
            width: "10",
            height: "5px",
            borderRadius: "3px",
            bg: "colorPalette.fg.muted",
        },
        head: {
            display: "flex",
            alignItems: "center",
            gap: "4",
        },
        heading: {
            display: "flex",
            flex: "1",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "1",
            minWidth: "0",
        },
        title: {
            fontSize: "22px",
            fontWeight: "bold",
            color: "colorPalette.fg",
            overflowWrap: "anywhere",
        },
        mode: {
            paddingX: "2.5",
            paddingY: "0.5",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            fontSize: "12px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        facts: {
            display: "flex",
            gap: "2",
        },
        fact: {
            display: "flex",
            flex: "1",
            flexDirection: "column",
            minWidth: "0",
            paddingX: "4",
            paddingY: "3",
            borderRadius: "panel",
            bg: "colorPalette.surface.subtle",
        },
        factLabel: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        factValue: {
            display: "flex",
            alignItems: "baseline",
            gap: "1",
            whiteSpace: "nowrap",
        },
        factNumber: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        factUnit: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        rows: {
            display: "flex",
            flexDirection: "column",
            borderRadius: "panel",
            bg: "colorPalette.surface.subtle",
        },
        row: {
            display: "flex",
            alignItems: "center",
            gap: "3",
            paddingX: "4",
            paddingY: "3.5",
        },
        // 持ち主の顔は 24px の角丸
        rowHead: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: "0",
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            overflow: "hidden",
            color: "colorPalette.fg.muted",
            "& > *": { width: "full", height: "full" },
            "& > img": { imageRendering: "pixelated" },
        },
        rowIcon: {
            flexShrink: "0",
            width: "20px",
            height: "20px",
            // 24px の顔と文字の頭をそろえる
            marginX: "2px",
        },
        rowText: {
            flex: "1",
            minWidth: "0",
            fontSize: "15px",
            fontWeight: "medium",
            overflowWrap: "anywhere",
        },
        rowMeta: {
            flexShrink: "0",
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
            whiteSpace: "nowrap",
        },
        action: {
            width: "full",
            textDecoration: "none",
        },
    },
});

// 在庫の数のあとに付ける単位。無限なら単位なしで ∞ だけ出す
const formatStock = (stock: number | null) =>
    stock === null ? "∞" : stock.toLocaleString("ja-JP");

/** シートの中身。shop が決まっているときだけ描く */
const ShopDetail = ({ shop }: { shop: ShopListing }) => {
    const style = shopDetailSheetStyle();
    const { location } = shop;
    // 知らないワールドの座標を別のワールドで開かないよう、/map で開けるのは対応するワールドだけ
    const worldLabel = location.worldId
        ? worldLabels[location.worldId]
        : location.world;

    return (
        <>
            <div className={style.handle} aria-hidden />
            <div className={style.head}>
                <ShopItemIcon itemId={shop.itemId} size="lg" />
                <div className={style.heading}>
                    <Dialog.Title className={style.title}>
                        {itemWithAmount(shop)}
                    </Dialog.Title>
                    <span className={style.mode}>
                        {shopModeLabels[shop.mode]}
                    </span>
                </div>
            </div>
            <dl className={style.facts}>
                <div className={style.fact}>
                    <dt className={style.factLabel}>ねだん</dt>
                    <dd className={style.factValue}>
                        <span className={style.factNumber}>
                            {formatPrice(shop.price)}
                        </span>
                        <span className={style.factUnit}>どんぐり</span>
                    </dd>
                </div>
                <div className={style.fact}>
                    <dt className={style.factLabel}>
                        {stockHeading(shop.mode)}
                    </dt>
                    <dd className={style.factValue}>
                        <span className={style.factNumber}>
                            {formatStock(shop.stock)}
                        </span>
                        {shop.stock !== null && (
                            <span className={style.factUnit}>個</span>
                        )}
                    </dd>
                </div>
            </dl>
            <div className={style.rows}>
                <div className={style.row}>
                    <span className={style.rowHead}>
                        <ShopOwnerHead owner={shop.owner} />
                    </span>
                    <span className={style.rowText}>
                        {ownerDisplayName(shop.owner)} のお店
                    </span>
                </div>
                <div className={style.row}>
                    <MapPin className={style.rowIcon} aria-label="場所" />
                    <span className={style.rowText}>
                        {formatCoordinates(location)}
                    </span>
                    <span className={style.rowMeta}>{worldLabel}</span>
                </div>
            </div>
            {location.worldId && (
                <Button asChild intent="primary" size="lg">
                    <Link
                        to="/map"
                        search={{
                            world: location.worldId,
                            x: location.x,
                            z: location.z,
                        }}
                        className={style.action}
                    >
                        マップで見る
                    </Link>
                </Button>
            )}
        </>
    );
};

export interface ShopDetailSheetProps {
    /** 表示するお店。閉じるアニメーションのあいだも中身を残すため、閉じても null にしなくてよい */
    shop: ShopListing | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** お店の詳細を下から出すシート */
export const ShopDetailSheet = ({
    shop,
    open,
    onOpenChange,
}: ShopDetailSheetProps) => {
    const style = shopDetailSheetStyle();
    return (
        <Dialog.Root
            open={open && shop !== null}
            onOpenChange={(details) => onOpenChange(details.open)}
            lazyMount
            unmountOnExit
        >
            <Portal>
                <Dialog.Backdrop className={style.backdrop} />
                <Dialog.Positioner className={style.positioner}>
                    <Dialog.Content className={style.content}>
                        {shop && <ShopDetail shop={shop} />}
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
