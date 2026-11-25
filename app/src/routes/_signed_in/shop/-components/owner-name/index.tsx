import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import { createContext, type ReactNode, useContext } from "react";
import { css } from "../../../../../../styled-system/css";
import { playerNameQueryOptions } from "../../-functions/player-names";
import type { ShopListing } from "../../-types/shop";

export interface OwnerNameProps {
    /** お店の持ち主。運営のお店なら null */
    owner: ShopListing["owner"];
}

// 名前がまだ届いていないあいだの仮の名前 (UUID の先頭) を控えめに出す
const pendingStyle = css({ color: "colorPalette.fg.muted" });

/** 一覧に入っている名前をそのまま出す (Storybook や、名前が分かっている画面向け) */
const StaticOwnerName = ({ owner }: OwnerNameProps) => owner?.name ?? "運営";

/** mc-api から名前を引いて出す。届くまでは一覧に入っている仮の名前を出す */
const ResolvedOwnerName = ({ owner }: OwnerNameProps) => {
    const { mcApiUrl } = useLoaderData({ from: "__root__" });
    const { data: name } = useQuery({
        ...playerNameQueryOptions(mcApiUrl, owner?.id ?? ""),
        enabled: owner !== null,
    });
    if (!owner) {
        return "運営";
    }
    if (name) {
        return name;
    }
    return <span className={pendingStyle}>{owner.name}</span>;
};

// mc-api から名前を引くか。既定では一覧の名前をそのまま出し、OwnerNameProvider の中だけで引く
const ResolveOwnerNameContext = createContext(false);

/**
 * 中のお店の持ち主の名前を、表示した行の分だけブラウザで引くようにする。
 * サーバーは名前を引かないため、最初の画面は mc-api を待たずに出る
 */
export const OwnerNameProvider = ({ children }: { children: ReactNode }) => (
    <ResolveOwnerNameContext.Provider value={true}>
        {children}
    </ResolveOwnerNameContext.Provider>
);

/** お店の持ち主の名前。運営のお店は「運営」 */
export const OwnerName = (props: OwnerNameProps) =>
    useContext(ResolveOwnerNameContext) ? (
        <ResolvedOwnerName {...props} />
    ) : (
        <StaticOwnerName {...props} />
    );
