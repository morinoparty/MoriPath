import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useId } from "react";
import { cx, sva } from "../../../../../../styled-system/css";
import {
    InlineSkeleton,
    Skeleton,
    skeletonKeys,
} from "../../../../../components/skeleton";
import type { MyStamps } from "../../-types/stamp";
import { StampTile } from "../stamp-tile";

/** 1 段に並べるタイルの数。スタンプ帳のページの格子 (390px 幅で 6〜7 列) と同じくらいの密度にする */
const COLUMN_COUNT = 7;
/** 並べる段の数 */
const ROW_COUNT = 2;
/** 並べられるタイルの数。収まらないときは最後の 1 枠を「+N」のタイルにする */
const TILE_CAPACITY = COLUMN_COUNT * ROW_COUNT;

const stampBookStyle = sva({
    slots: [
        "root",
        "header",
        "title",
        "count",
        "moreLink",
        "moreIcon",
        "row",
        "rest",
        "empty",
        "tileSkeleton",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
        header: {
            display: "flex",
            alignItems: "center",
            gap: "3",
        },
        title: {
            // メニューのセクション見出しとそろえる
            flex: "1",
            fontSize: "18px",
            fontWeight: "bold",
            lineHeight: "1.5",
            color: "colorPalette.fg",
        },
        count: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
            fontVariantNumeric: "tabular-nums",
        },
        // ホームのダイアリーの「すべて見る」とそろえる
        moreLink: {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5",
            textStyle: "sm",
            color: "colorPalette.fg.muted",
            _hover: {
                color: "colorPalette.fg",
            },
        },
        moreIcon: {
            width: "4",
            height: "4",
        },
        row: {
            // 7 列 × 2 段。狭い画面ではタイルを縮めて 7 列に収める
            display: "grid",
            gridTemplateColumns: `repeat(${COLUMN_COUNT}, minmax(0, 44px))`,
            justifyContent: "space-between",
            gap: "1.5",
            listStyle: "none",
            margin: "0",
            padding: "0",
        },
        rest: {
            // 残り枚数のタイルは、押すとスタンプ帳のページへ進む
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            aspectRatio: "1",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
            // 残り枚数は字形より小さい文字で添える
            textStyle: "sm",
            fontWeight: "medium",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg.muted",
            _hover: {
                color: "colorPalette.fg",
            },
        },
        empty: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
        },
        // 届くまでのタイル。スタンプのタイルと同じ正方形と角丸にする
        tileSkeleton: {
            // Skeleton 既定の 1 行ぶんの高さを外し、幅から正方形にする
            height: "auto",
            aspectRatio: "1",
            borderRadius: "panel",
        },
    },
});

export interface StampBookProps {
    stamps: MyStamps;
    className?: string;
}

/** マイページのスタンプ帳。持っているスタンプの先頭 2 段ぶんと、残りの枚数を並べる */
export const StampBook = ({ stamps, className }: StampBookProps) => {
    const classes = stampBookStyle();
    const titleId = useId();
    // 全部収まるなら「+N」は出さず、収まらなければ最後の 1 枠を「+N」に譲る
    const visible =
        stamps.owned.length <= TILE_CAPACITY
            ? stamps.owned
            : stamps.owned.slice(0, TILE_CAPACITY - 1);
    const restCount = stamps.owned.length - visible.length;

    return (
        <section
            className={cx(classes.root, className)}
            aria-labelledby={titleId}
        >
            <div className={classes.header}>
                <h2 id={titleId} className={classes.title}>
                    スタンプ帳
                </h2>
                <span className={classes.count}>
                    {/* SSR とブラウザで桁区切りがずれないよう、ロケールを固定する */}
                    {stamps.owned.length.toLocaleString("ja-JP")} /{" "}
                    {stamps.total.toLocaleString("ja-JP")}
                </span>
                <Link to="/my-page/stamps" className={classes.moreLink}>
                    すべて見る
                    <ChevronRight className={classes.moreIcon} aria-hidden />
                </Link>
            </div>
            {visible.length === 0 ? (
                <p className={classes.empty}>まだスタンプがありません</p>
            ) : (
                <ul className={classes.row}>
                    {visible.map((stamp) => (
                        <li key={stamp.shortCode}>
                            <StampTile stamp={stamp} />
                        </li>
                    ))}
                    {restCount > 0 && (
                        <li>
                            <Link
                                to="/my-page/stamps"
                                className={classes.rest}
                                aria-label={`ほか ${restCount} 枚をすべて見る`}
                            >
                                +{restCount}
                            </Link>
                        </li>
                    )}
                </ul>
            )}
        </section>
    );
};

/** スタンプが届くまでのスタンプ帳。見出しはそのまま出し、枚数とタイルの場所を取る */
export const StampBookSkeleton = ({ className }: { className?: string }) => {
    const classes = stampBookStyle();
    return (
        <section className={cx(classes.root, className)} aria-busy="true">
            <div className={classes.header}>
                <h2 className={classes.title}>スタンプ帳</h2>
                <span className={classes.count}>
                    <InlineSkeleton width="4em" />
                </span>
            </div>
            {/* 届いた後と同じ 7 列 × 2 段ぶん並べる */}
            <div className={classes.row}>
                {skeletonKeys(TILE_CAPACITY).map((key) => (
                    <Skeleton key={key} className={classes.tileSkeleton} />
                ))}
            </div>
        </section>
    );
};
