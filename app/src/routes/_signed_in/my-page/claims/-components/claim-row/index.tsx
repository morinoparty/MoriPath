import { Link } from "@tanstack/react-router";
import { LandPlot } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import { formatNumber } from "../../../../../../lib/format-number";
import { worldLabels } from "../../../../map/-functions/world-labels";
import type { MyClaim } from "../../-types/my-claim";

const claimRowStyle = sva({
    slots: [
        "root",
        "icon",
        "info",
        "world",
        "detail",
        "area",
        "areaValue",
        "unit",
    ],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            gap: "3",
            width: "full",
            paddingY: "3",
            paddingLeft: "3",
            paddingRight: "4",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
            color: "colorPalette.fg",
            lineHeight: "1.4",
            textDecoration: "none",
            transition: "background 0.15s",
            // /map で開ける行だけを押せる見た目にする
            "&[href]": {
                cursor: "pointer",
                _hover: { bg: "colorPalette.surface.hover" },
            },
        },
        // 一覧の行の高さをお店の行 (48px のアイコン) とそろえる
        icon: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: "0",
            width: "48px",
            height: "48px",
            borderRadius: "control",
            bg: "colorPalette.bg",
            color: "colorPalette.fg.muted",
            "& > svg": { width: "22px", height: "22px" },
        },
        info: {
            display: "flex",
            flex: "1",
            flexDirection: "column",
            gap: "0.5",
            minWidth: "0",
        },
        world: {
            fontSize: "15px",
            fontWeight: "bold",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        detail: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        area: {
            display: "flex",
            alignItems: "baseline",
            gap: "3px",
            flexShrink: "0",
            whiteSpace: "nowrap",
        },
        areaValue: {
            fontSize: "18px",
            fontWeight: "bold",
        },
        unit: {
            fontSize: "11px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
    },
});

export interface ClaimRowProps {
    claim: MyClaim;
}

/** 保護している土地の 1 行。/map で開けるワールドなら、押すとその中心を地図で開く */
export const ClaimRow = ({ claim }: ClaimRowProps) => {
    const style = claimRowStyle();
    // 知らないワールドはサーバー上の名前をそのまま出す
    const worldLabel = claim.worldId ? worldLabels[claim.worldId] : claim.world;
    const content = (
        <>
            <span className={style.icon}>
                <LandPlot aria-hidden />
            </span>
            <span className={style.info}>
                <span className={style.world}>{worldLabel}</span>
                <span className={style.detail}>
                    {claim.width} × {claim.depth} ・ 中心 {claim.center.x},{" "}
                    {claim.center.z}
                </span>
            </span>
            <span className={style.area}>
                <span className={style.areaValue}>
                    {formatNumber(claim.area)}
                </span>
                <span className={style.unit}>ブロック</span>
            </span>
        </>
    );

    // 知らないワールドの座標を別のワールドで開かないよう、リンクにしない
    if (!claim.worldId) {
        return <div className={style.root}>{content}</div>;
    }
    return (
        <Link
            to="/map"
            search={{
                world: claim.worldId,
                x: claim.center.x,
                z: claim.center.z,
            }}
            className={style.root}
        >
            {content}
        </Link>
    );
};
