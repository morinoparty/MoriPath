import { createFileRoute } from "@tanstack/react-router";
import { TrainFront } from "lucide-react";
import { sva } from "../../../../../styled-system/css";
import { SubPageBar } from "../../../../components/sub-page-bar";

export const Route = createFileRoute("/_signed_in/map/transit/")({
    component: TransitPage,
});

const transitPageStyle = sva({
    slots: ["root", "empty", "icon", "title", "description"],
    base: {
        // タブバーを出さない下層ページなので、画面の高さいっぱいに地の色を敷く
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
        // まだ中身が無いので、画面の中ほどに案内だけを置く
        empty: {
            flex: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3",
            textAlign: "center",
        },
        icon: {
            display: "grid",
            placeItems: "center",
            width: "16",
            height: "16",
            borderRadius: "full",
            bg: "colorPalette.surface",
            color: "colorPalette.fg",
            "& svg": {
                width: "28px",
                height: "28px",
            },
        },
        title: {
            textStyle: "lg",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        description: {
            textStyle: "sm",
            fontWeight: "medium",
            color: "fg.muted",
        },
    },
});

/** 乗換案内のページ。経路の検索はまだ無いため、準備中の案内だけを出す */
function TransitPage() {
    const style = transitPageStyle();
    return (
        <div className={style.root}>
            <SubPageBar title="乗換案内" backTo="/map" />
            <div className={style.empty}>
                <span className={style.icon} aria-hidden>
                    <TrainFront />
                </span>
                <p className={style.title}>準備中です</p>
                <p className={style.description}>もうしばらくお待ちください</p>
            </div>
        </div>
    );
}
