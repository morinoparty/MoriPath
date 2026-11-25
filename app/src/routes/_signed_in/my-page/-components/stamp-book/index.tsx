import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useId } from "react";
import { cx, sva } from "../../../../../../styled-system/css";
import { toStampLabel } from "../../-functions/stamp-display";
import type { MyStamps } from "../../-types/stamp";
import { StampTile } from "../stamp-tile";

/** 1 列に並べるスタンプの最大数。残りは「+N」のタイルにまとめる */
const VISIBLE_STAMP_COUNT = 6;

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
        "label",
        "empty",
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
            // 6 枚 + 「+N」の 7 枠。狭い画面ではタイルを縮めて 1 列に収める
            display: "grid",
            gridTemplateColumns: `repeat(${VISIBLE_STAMP_COUNT + 1}, minmax(0, 44px))`,
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
            borderRadius: "control",
            // 残り枚数は字形より小さい文字で添える
            textStyle: "sm",
            fontWeight: "medium",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg.muted",
            _hover: {
                color: "colorPalette.fg",
            },
        },
        label: {
            // 画面には出さず、読み上げにだけスタンプ名を渡す
            srOnly: true,
        },
        empty: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
        },
    },
});

export interface StampBookProps {
    stamps: MyStamps;
    className?: string;
}

/** マイページのスタンプ帳。持っているスタンプの先頭 6 枚と、残りの枚数を並べる */
export const StampBook = ({ stamps, className }: StampBookProps) => {
    const classes = stampBookStyle();
    const titleId = useId();
    const visible = stamps.owned.slice(0, VISIBLE_STAMP_COUNT);
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
                    {visible.map((stamp) => {
                        const label = toStampLabel(stamp.shortCode);
                        return (
                            <li key={stamp.shortCode}>
                                <StampTile stamp={stamp} title={label} />
                                {/* 絵文字は読み上げると名前と食い違うことがあるため、名前だけを読ませる */}
                                <span className={classes.label}>{label}</span>
                            </li>
                        );
                    })}
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
