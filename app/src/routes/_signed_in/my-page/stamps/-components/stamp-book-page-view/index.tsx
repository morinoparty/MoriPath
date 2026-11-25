import { Button } from "@morinoparty/chlorophyll-react/components";
import { RotateCw, Stamp as StampIcon } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../../components/sub-page-bar";
import { StampTile } from "../../../-components/stamp-tile";
import type { MyStamps } from "../../../-types/stamp";

const stampBookPageStyle = sva({
    slots: [
        "root",
        "summary",
        "ownedCount",
        "totalCount",
        "grid",
        "notice",
        "noticeIcon",
        "noticeText",
    ],
    base: {
        // タブバーを出さない下層ページなので、地色と下端の余白はここで持つ
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
        summary: {
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "1",
            fontVariantNumeric: "tabular-nums",
        },
        ownedCount: {
            textStyle: "display",
            fontSize: "32px",
            color: "colorPalette.fg",
        },
        totalCount: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
        },
        grid: {
            // 端末の幅に合わせて列数を変える。390px 幅で 6 列、広い画面ではさらに増やす
            // タイルは 44px より小さくしない
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
            gap: "2",
            listStyle: "none",
            margin: "0",
            padding: "0",
        },
        notice: {
            // 空や失敗の案内は、本文の中ほどに寄せる
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3",
            flex: "1",
            paddingBottom: "16",
            textAlign: "center",
        },
        noticeIcon: {
            width: "40px",
            height: "40px",
            color: "colorPalette.fg.muted",
        },
        noticeText: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
        },
    },
});

type StampBookPageClasses = ReturnType<typeof stampBookPageStyle>;

interface StampGridProps {
    stamps: MyStamps;
    classes: StampBookPageClasses;
}

/** 持っているスタンプの枚数と、スタンプの格子 */
const StampGrid = ({ stamps, classes }: StampGridProps) => {
    // 持っていないときは格子の代わりに一言だけ出す
    if (stamps.owned.length === 0) {
        return (
            <div className={classes.notice}>
                <StampIcon className={classes.noticeIcon} aria-hidden />
                <p className={classes.noticeText}>まだスタンプがありません</p>
            </div>
        );
    }

    return (
        <>
            <p className={classes.summary}>
                {/* SSR とブラウザで桁区切りがずれないよう、ロケールを固定する */}
                <span className={classes.ownedCount}>
                    {stamps.owned.length.toLocaleString("ja-JP")}
                </span>
                <span className={classes.totalCount}>
                    / {stamps.total.toLocaleString("ja-JP")}
                </span>
            </p>
            <ul className={classes.grid}>
                {stamps.owned.map((stamp) => (
                    <li key={stamp.shortCode}>
                        <StampTile stamp={stamp} size="lg" />
                    </li>
                ))}
            </ul>
        </>
    );
};

export interface StampBookPageViewProps {
    /** 自分のスタンプ。取得できなかったときは null */
    stamps: MyStamps | null;
    /** 再読み込みボタンを押したとき。ルートでは router.invalidate() で loader を取り直す */
    onRetry: () => void;
}

/** スタンプ帳のページ。持っているスタンプをすべて並べる */
export const StampBookPageView = ({
    stamps,
    onRetry,
}: StampBookPageViewProps) => {
    const classes = stampBookPageStyle();
    return (
        <div className={classes.root}>
            <SubPageBar title="スタンプ帳" backTo="/my-page" />
            {stamps ? (
                <StampGrid stamps={stamps} classes={classes} />
            ) : (
                // マイページでは隠すだけだが、このページでは空と区別して再読み込みを促す
                <div className={classes.notice} role="alert">
                    <p className={classes.noticeText}>
                        スタンプを読み込めませんでした
                    </p>
                    <Button intent="secondary" onClick={onRetry}>
                        <RotateCw size={16} aria-hidden />
                        再読み込み
                    </Button>
                </div>
            )}
        </div>
    );
};
