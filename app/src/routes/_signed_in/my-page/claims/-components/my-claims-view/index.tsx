import { Button } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { sva } from "../../../../../../../styled-system/css";
import {
    InlineSkeleton,
    skeletonKeys,
} from "../../../../../../components/skeleton";
import { SubPageBar } from "../../../../../../components/sub-page-bar";
import { formatNumber } from "../../../../../../lib/format-number";
import type { MyClaimsPageData } from "../../-types/my-claim";
import { ClaimRow, ClaimRowSkeleton } from "../claim-row";

// 読み込み中に並べるスケルトンの行数
const LOADING_ROWS = 3;

const myClaimsViewStyle = sva({
    slots: [
        "root",
        "summary",
        "stat",
        "statLabel",
        "statValue",
        "statUnit",
        "statSkeleton",
        "buy",
        "list",
        "message",
        "status",
    ],
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
        // 枠線と影を持たない面のカードに、残りの保護ブロックと買うボタンを横に並べる
        summary: {
            display: "flex",
            alignItems: "center",
            gap: "3",
            padding: "4",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
        },
        stat: {
            display: "flex",
            flex: "1",
            flexDirection: "column",
            minWidth: "0",
            lineHeight: "1.4",
        },
        statLabel: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        statValue: {
            display: "flex",
            alignItems: "baseline",
            gap: "1",
            fontSize: "24px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        // 数字の行の高さの中で、帯を上下の真ん中に置く
        statSkeleton: { alignSelf: "center" },
        // スケルトンを出しているあいだの、読み上げ用の文
        status: { srOnly: true },
        statUnit: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        buy: {
            flexShrink: "0",
            borderRadius: "full",
            textDecoration: "none",
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

export interface MyClaimsViewProps {
    /** 保護ブロックと保護している土地。取れなかったときは null */
    data: MyClaimsPageData | null;
    /** loader を待っている途中か。数字と一覧の代わりにスケルトンを出す */
    loading?: boolean;
}

/** 保護している土地の画面。残りの保護ブロックと、土地の一覧を縦に並べる */
export const MyClaimsView = ({ data, loading = false }: MyClaimsViewProps) => {
    const style = myClaimsViewStyle();
    return (
        <div className={style.root}>
            <SubPageBar title="保護した土地" backTo="/my-page" />
            <div className={style.summary}>
                <div className={style.stat}>
                    <span className={style.statLabel}>保護ブロック</span>
                    <span className={style.statValue}>
                        {loading ? (
                            <InlineSkeleton
                                width="4em"
                                className={style.statSkeleton}
                            />
                        ) : data ? (
                            formatNumber(data.remainingClaimBlocks)
                        ) : (
                            "—"
                        )}
                        {data && (
                            <span className={style.statUnit}>ブロック</span>
                        )}
                    </span>
                </div>
                <Button asChild intent="primary" size="sm">
                    <Link to="/balance-claim" className={style.buy}>
                        保護ブロックを買う
                    </Link>
                </Button>
            </div>
            {loading ? (
                <>
                    <output className={style.status}>
                        土地を読み込んでいます
                    </output>
                    <ul className={style.list}>
                        {skeletonKeys(LOADING_ROWS).map((key) => (
                            <li key={key} aria-hidden>
                                <ClaimRowSkeleton />
                            </li>
                        ))}
                    </ul>
                </>
            ) : data === null ? (
                <p className={style.message}>
                    土地の情報を読み込めませんでした
                </p>
            ) : data.claims.length === 0 ? (
                <p className={style.message}>保護した土地はありません</p>
            ) : (
                <ul className={style.list}>
                    {data.claims.map((claim) => (
                        <li key={claim.id}>
                            <ClaimRow claim={claim} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
