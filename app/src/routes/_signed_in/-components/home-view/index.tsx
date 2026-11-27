import { sva } from "../../../../../styled-system/css";
import { HomeHeader } from "../../../../components/home-header";
import type { SessionData } from "../../../../lib/server-functions";
import type { DiaryEntry } from "../../-types/diary";
import type { OnlinePlayer } from "../../-types/online-player";
import { BalanceTile } from "../balance-tile";
import { Deferred, type MaybePromise } from "../deferred";
import { DiarySection } from "../diary-section";
import { OnlinePlayers } from "../online-players";
import { OnlineStripSkeleton } from "../online-strip";
import { SkinCard } from "../skin-card";

// ホームのダイアリーに出す件数 (新しいほうから)
const HOME_DIARY_LIMIT = 3;

const homeViewStyle = sva({
    slots: ["root", "body", "title", "hero", "balances"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            // ノッチ付き端末ではステータスバーの下から始める
            // ヘッダーの上下の余白 (8px) と合わせて、地図の操作ボタンと同じ safe area + 16px の高さにそろえる
            paddingTop: "calc(env(safe-area-inset-top) + {spacing.2})",
        },
        body: {
            display: "flex",
            flexDirection: "column",
            gap: "5",
            paddingX: "6",
            paddingTop: "2",
        },
        title: {
            textStyle: "3xl",
            fontWeight: "bold",
            lineHeight: "1.3",
            color: "colorPalette.fg",
        },
        // スキンのカードと残高の列を横に並べ、残高の列はカードの高さいっぱいに伸ばす
        hero: {
            display: "flex",
            alignItems: "stretch",
            gap: "3",
            "& > :first-child": {
                flex: "1",
            },
        },
        balances: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
            width: "142px",
            flexShrink: "0",
        },
    },
});

/** ホームに表示するプレイヤー */
export interface HomePlayer {
    /** Minecraft の UUID。取得できなければ null */
    id: string | null;
    name: string;
}

export interface HomeViewProps {
    session: SessionData;
    player: HomePlayer;
    /** どんぐり (Vault 残高)。取得できなければ null、届くまでは Promise */
    balance: MaybePromise<number | null>;
    /** 残りの保護ブロック数。取得できなければ null、届くまでは Promise */
    claimBlocks: MaybePromise<number | null>;
    /** 連続投票日数。取得できなければ null、届くまでは Promise */
    voteStreak: MaybePromise<number | null>;
    /** ダイアリーの記録 (タームの順)。取得できなければ null、届くまでは Promise */
    diaryEntries: MaybePromise<DiaryEntry[] | null>;
    /** いまオンラインのプレイヤー。取得できなければ null (帯ごと出さない)、取得中は undefined */
    onlinePlayers: OnlinePlayer[] | null | undefined;
}

interface DeferredBalanceTileProps {
    label: string;
    value: MaybePromise<number | null>;
    unit?: string;
}

/** 値が届くまではラベルだけ先に出し、数字の場所にスケルトンを置くタイル */
const DeferredBalanceTile = ({
    label,
    value,
    unit,
}: DeferredBalanceTileProps) => (
    <Deferred
        value={value}
        fallback={
            <BalanceTile label={label} value={null} unit={unit} loading />
        }
    >
        {(resolved) => (
            <BalanceTile label={label} value={resolved} unit={unit} />
        )}
    </Deferred>
);

/**
 * ホーム画面の見た目。データの取得はルートの loader が行う。
 * 見出しとスキンはすぐ出し、残高・ダイアリー・オンライン一覧は届いたところから埋める
 */
export const HomeView = ({
    session,
    player,
    balance,
    claimBlocks,
    voteStreak,
    diaryEntries,
    onlinePlayers,
}: HomeViewProps) => {
    const style = homeViewStyle();

    return (
        <div className={style.root}>
            <HomeHeader.Builted session={session} />
            <div className={style.body}>
                <h1 className={style.title}>もりのパーティ</h1>
                {onlinePlayers === undefined ? (
                    <OnlineStripSkeleton />
                ) : (
                    // 人数が取れなかったときに「誰もいない」と誤って伝えないよう、帯ごと出さない
                    onlinePlayers && <OnlinePlayers players={onlinePlayers} />
                )}
                <div className={style.hero}>
                    <SkinCard playerId={player.id} playerName={player.name} />
                    <div className={style.balances}>
                        <DeferredBalanceTile label="どんぐり" value={balance} />
                        <DeferredBalanceTile
                            label="保護ブロック"
                            value={claimBlocks}
                        />
                        <DeferredBalanceTile
                            label="連続投票"
                            value={voteStreak}
                            unit="日"
                        />
                    </div>
                </div>
                <DiarySection.Root>
                    <DiarySection.Header />
                    <Deferred
                        value={diaryEntries}
                        fallback={
                            <DiarySection.EntriesSkeleton
                                count={HOME_DIARY_LIMIT}
                            />
                        }
                    >
                        {(entries) => (
                            // ホームでは最新の数件だけを時刻順に見せ、続きは一覧ページに任せる
                            <DiarySection.Entries
                                entries={(entries ?? []).slice(
                                    -HOME_DIARY_LIMIT,
                                )}
                            />
                        )}
                    </Deferred>
                </DiarySection.Root>
            </div>
        </div>
    );
};
