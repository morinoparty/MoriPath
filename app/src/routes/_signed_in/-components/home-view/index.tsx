import { sva } from "../../../../../styled-system/css";
import { HomeHeader } from "../../../../components/home-header";
import type { SessionData } from "../../../../lib/server-functions";
import type { DiaryEntry } from "../../-types/diary";
import { BalanceTile } from "../balance-tile";
import { DiarySection } from "../diary-section";
import { SkinCard } from "../skin-card";

const homeViewStyle = sva({
    slots: ["root", "body", "title", "hero", "balances"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            // ノッチ付き端末ではステータスバーの下から始める
            paddingTop: "max(token(spacing.2), env(safe-area-inset-top))",
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
    /** どんぐり (Vault 残高)。取得できなければ null */
    balance: number | null;
    /** 残りの保護ブロック数。取得できなければ null */
    claimBlocks: number | null;
    /** 連続投票日数。取得できなければ null */
    voteStreak: number | null;
    diaryEntries: DiaryEntry[];
}

/** ホーム画面の見た目。データの取得はルートの loader が行う */
export const HomeView = ({
    session,
    player,
    balance,
    claimBlocks,
    voteStreak,
    diaryEntries,
}: HomeViewProps) => {
    const style = homeViewStyle();

    return (
        <div className={style.root}>
            <HomeHeader.Builted session={session} />
            <div className={style.body}>
                <h1 className={style.title}>もりのパーティ</h1>
                <div className={style.hero}>
                    <SkinCard playerId={player.id} playerName={player.name} />
                    <div className={style.balances}>
                        <BalanceTile label="どんぐり" value={balance} />
                        <BalanceTile label="保護ブロック" value={claimBlocks} />
                        <BalanceTile
                            label="連続投票"
                            value={voteStreak}
                            unit="日"
                        />
                    </div>
                </div>
                <DiarySection.Root>
                    <DiarySection.Header />
                    <DiarySection.Entries entries={diaryEntries} />
                </DiarySection.Root>
            </div>
        </div>
    );
};
