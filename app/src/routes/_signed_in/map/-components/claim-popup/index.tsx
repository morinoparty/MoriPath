import { PlayerAvatar } from "@morinoparty/chlorophyll-react/components";
import { Shield } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import type { ClaimInfo } from "../../-types/world-map";
import { MapPopupCard } from "../map-popup-card";

const claimPopupStyle = sva({
    slots: [
        "header",
        "headerIcon",
        "owner",
        "ownerName",
        "trusts",
        "trust",
        "trustLabel",
        "trustNames",
    ],
    base: {
        header: {
            display: "flex",
            alignItems: "center",
            gap: "1",
            fontSize: "xs",
            fontWeight: "bold",
            color: "fg.muted",
        },
        headerIcon: {
            width: "14px",
            height: "14px",
        },
        owner: {
            display: "flex",
            alignItems: "center",
            gap: "2",
            mt: "2",
        },
        ownerName: {
            fontSize: "md",
            fontWeight: "bold",
            color: "colorPalette.fg",
            lineHeight: "1.4",
            wordBreak: "break-all",
        },
        trusts: {
            display: "flex",
            flexDirection: "column",
            gap: "2",
            mt: "3",
            pt: "3",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: "border.muted",
            // 信頼しているプレイヤーが多い保護でも画面を埋めないよう、高さを抑えてスクロールさせる
            maxHeight: "160px",
            overflowY: "auto",
        },
        trust: {
            display: "flex",
            flexDirection: "column",
        },
        trustLabel: {
            fontSize: "xs",
            color: "fg.muted",
        },
        trustNames: {
            fontWeight: "bold",
            color: "fg",
            wordBreak: "break-all",
        },
    },
});

// 表示する信頼の種類と、その見出し (GriefPrevention の権限名そのまま)
const trustKinds = [
    { key: "permissionTrust", label: "Permission Trust" },
    { key: "trust", label: "Trust" },
    { key: "containerTrust", label: "Container Trust" },
    { key: "accessTrust", label: "Access Trust" },
] as const;

export interface ClaimPopupProps {
    claim: ClaimInfo;
}

/** 保護範囲をタップしたときの持ち主と信頼の一覧 */
export const ClaimPopup = ({ claim }: ClaimPopupProps) => {
    const style = claimPopupStyle();
    // 空の種類は見出しごと出さない
    const trusts = trustKinds.filter(({ key }) => claim[key].length > 0);
    return (
        <MapPopupCard>
            <p className={style.header}>
                <Shield className={style.headerIcon} aria-hidden />
                {claim.isAdmin ? "運営の保護" : "保護"}
            </p>
            {!claim.isAdmin && claim.owner && (
                <div className={style.owner}>
                    {/* プレイヤー API は名前でも引けるので、UUID の代わりに名前を渡す */}
                    <PlayerAvatar
                        playerId={claim.owner}
                        playerName={claim.owner}
                        size="sm"
                        decorative
                    />
                    <span className={style.ownerName}>{claim.owner}</span>
                </div>
            )}
            {trusts.length > 0 && (
                <dl className={style.trusts}>
                    {trusts.map(({ key, label }) => (
                        <div key={key} className={style.trust}>
                            <dt className={style.trustLabel}>{label}</dt>
                            <dd className={style.trustNames}>
                                {claim[key].join(", ")}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}
        </MapPopupCard>
    );
};
