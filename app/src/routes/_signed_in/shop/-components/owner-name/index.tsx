import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import { createContext, type ReactNode, useContext } from "react";
import { css } from "../../../../../../styled-system/css";
import { InlineSkeleton } from "../../../../../components/skeleton";
import { playerNameQueryOptions } from "../../-functions/player-names";
import type { ShopListing } from "../../-types/shop";

export interface OwnerNameProps {
    /** お店の持ち主。運営のお店なら null */
    owner: ShopListing["owner"];
}

// 名前が届くまでの帯の幅。Minecraft の名前 (3〜16 文字) のよくある長さに合わせる
const PENDING_NAME_WIDTH = "6em";

// mc-api に登録されていない (名前を引けない) 持ち主
const UNKNOWN_OWNER = "名前不明";

/** 名前が届くまでの場所取り。文字の高さの帯にして、届いたときに行がずれないようにする */
export const OwnerNameSkeleton = () => (
    <>
        <InlineSkeleton width={PENDING_NAME_WIDTH} />
        {/* 帯は読み上げないため、読み込み中であることだけを伝える */}
        <span className={css({ srOnly: true })}>読み込み中</span>
    </>
);

/** 一覧に入っている名前をそのまま出す (Storybook や、名前が分かっている画面向け) */
const StaticOwnerName = ({ owner }: OwnerNameProps) =>
    owner ? (owner.name ?? UNKNOWN_OWNER) : "運営";

/** mc-api から名前を引いて出す。届くまでは名前くらいの幅のスケルトンで場所だけ取る */
const ResolvedOwnerName = ({ owner }: OwnerNameProps) => {
    const { mcApiUrl } = useLoaderData({ from: "__root__" });
    const { data: name, isPending } = useQuery({
        ...playerNameQueryOptions(mcApiUrl, owner?.id ?? ""),
        enabled: owner !== null && owner.name === null,
    });
    if (!owner) {
        return "運営";
    }
    // 一覧の時点で名前が分かっているとき (自分のお店など) はそれを使う
    if (owner.name) {
        return owner.name;
    }
    if (name) {
        return name;
    }
    if (isPending) {
        return <OwnerNameSkeleton />;
    }
    return UNKNOWN_OWNER;
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
