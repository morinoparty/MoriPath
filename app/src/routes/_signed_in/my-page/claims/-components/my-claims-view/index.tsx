import { Button } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { sva } from "../../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../../components/sub-page-bar";
import { formatNumber } from "../../../../../../lib/format-number";
import type { MyClaimsPageData } from "../../-types/my-claim";
import { ClaimRow } from "../claim-row";

const myClaimsViewStyle = sva({
    slots: [
        "root",
        "summary",
        "stat",
        "statLabel",
        "statValue",
        "statUnit",
        "buy",
        "list",
        "message",
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
}

/** 保護している土地の画面。残りの保護ブロックと、土地の一覧を縦に並べる */
export const MyClaimsView = ({ data }: MyClaimsViewProps) => {
    const style = myClaimsViewStyle();
    return (
        <div className={style.root}>
            <SubPageBar title="保護した土地" backTo="/my-page" />
            <div className={style.summary}>
                <div className={style.stat}>
                    <span className={style.statLabel}>保護ブロック</span>
                    <span className={style.statValue}>
                        {data ? formatNumber(data.remainingClaimBlocks) : "—"}
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
            {data === null ? (
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
