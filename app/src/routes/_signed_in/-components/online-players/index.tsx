import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import {
    Drawer,
    IconButton,
    PlayerPhraseCard,
} from "@morinoparty/chlorophyll-react/components";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { sva } from "../../../../../styled-system/css";
import { groupOnlinePlayers } from "../../-functions/group-online-players";
import type { OnlinePlayer } from "../../-types/online-player";
import { OnlineStrip } from "../online-strip";

// 開いているあいだフレーズの基準時刻を進める間隔。フレーズ自体は 5 分ごとに切り替わる
const PHRASE_CLOCK_INTERVAL_MS = 60 * 1000;

const onlinePlayersSheetStyle = sva({
    slots: [
        "backdrop",
        "positioner",
        "content",
        "header",
        "heading",
        "title",
        "description",
        "close",
        "groups",
        "group",
        "groupTitle",
        "groupCount",
        "list",
    ],
    base: {
        // パレットの文字色を薄く敷いて、後ろのホームを沈める
        backdrop: {
            bg: "colorPalette.fg/32",
        },
        // ボトムシートを画面の幅いっぱいではなく、ホームの本文の幅で中央に寄せる
        positioner: {
            alignItems: "center",
        },
        // 開閉のアニメーション・85dvh で止めて中をスクロールする動きは Chlorophyll の Drawer に任せ、余白と幅だけを決める
        content: {
            gap: "5",
            maxWidth: "md",
            paddingX: "6",
            // ホームインジケーターのある端末では、その分だけ下を空ける
            paddingBottom:
                "max(token(spacing.10), env(safe-area-inset-bottom))",
            // Morino Party のカードに合わせて、上の角を大きく丸める
            borderTopRadius: "3xl",
        },
        header: {
            display: "flex",
            alignItems: "flex-start",
            gap: "3",
        },
        heading: {
            display: "flex",
            flex: "1",
            flexDirection: "column",
            gap: "0.5",
            minWidth: "0",
            lineHeight: "1.4",
        },
        title: {
            textStyle: "xl",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        description: {
            textStyle: "sm",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        close: {
            flexShrink: "0",
            bg: "colorPalette.surface.subtle",
        },
        groups: {
            display: "flex",
            flexDirection: "column",
            gap: "6",
        },
        group: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
        // サーバー名は一覧の区切りなので、タイトルより控えめに出す
        groupTitle: {
            display: "flex",
            alignItems: "baseline",
            gap: "1.5",
            textStyle: "sm",
            fontWeight: "bold",
            color: "colorPalette.fg.muted",
        },
        groupCount: {
            fontWeight: "medium",
            fontVariantNumeric: "tabular-nums",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "4",
            listStyle: "none",
        },
    },
});

interface OnlinePlayersSheetProps {
    players: OnlinePlayer[];
    /** フレーズの基準時刻 (ms)。Storybook などで固定したいときだけ渡す */
    referenceTime?: number;
}

/**
 * フレーズ付きのプレイヤー一覧。Drawer.Content の中に置き、Root の lazyMount で
 * 開いたときに初めてクライアントで描かれるため、現在時刻から作るフレーズが
 * サーバーの描画とずれる (ハイドレーションの不一致) ことはない
 */
const OnlinePlayersList = ({
    players,
    referenceTime,
}: OnlinePlayersSheetProps) => {
    const style = onlinePlayersSheetStyle();
    // 開いた時刻を基準にし、開いたままでも 5 分の区切りをまたげばフレーズが替わるよう時計を進める
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(
            () => setNow(Date.now()),
            PHRASE_CLOCK_INTERVAL_MS,
        );
        return () => clearInterval(timer);
    }, []);

    // ロビー・メイン・資源の順にサーバーごとに分け、誰もいないサーバーは出さない
    const groups = groupOnlinePlayers(players);

    return (
        <div className={style.groups}>
            {groups.map((group) => (
                <section key={group.server} className={style.group}>
                    <h3 className={style.groupTitle}>
                        {group.label}
                        <span className={style.groupCount}>
                            {group.players.length}人
                        </span>
                    </h3>
                    <ul className={style.list}>
                        {group.players.map((player) => (
                            <li key={player.id}>
                                {/* フレーズは morino.party のフッターと同じく Chlorophyll の randomPhrase で作る */}
                                <PlayerPhraseCard.Root
                                    playerId={player.id}
                                    playerName={player.name}
                                    referenceTime={referenceTime ?? now}
                                >
                                    <PlayerPhraseCard.Avatar />
                                    <PlayerPhraseCard.Body>
                                        <PlayerPhraseCard.Phrase />
                                        <PlayerPhraseCard.Name />
                                    </PlayerPhraseCard.Body>
                                </PlayerPhraseCard.Root>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
};

// 下から開くシート本体 (暗幕・見出し・閉じるボタン・一覧)
const OnlinePlayersSheet = ({
    players,
    referenceTime,
}: OnlinePlayersSheetProps) => {
    const style = onlinePlayersSheetStyle();

    return (
        <Portal>
            <Drawer.Backdrop className={style.backdrop} />
            <Drawer.Positioner className={style.positioner}>
                <Drawer.Content className={style.content}>
                    <Drawer.Handle />
                    {/* Drawer は Ark UI の Dialog なので、見出しと説明・閉じるボタンは Dialog の部品で Content に結び付ける */}
                    <div className={style.header}>
                        <div className={style.heading}>
                            <Dialog.Title className={style.title}>
                                こんな人たちも遊んでる
                            </Dialog.Title>
                            <Dialog.Description className={style.description}>
                                {players.length}人がプレイ中
                            </Dialog.Description>
                        </div>
                        <Dialog.CloseTrigger asChild>
                            <IconButton
                                variant="ghost"
                                shape="circle"
                                aria-label="閉じる"
                                className={style.close}
                            >
                                <XIcon />
                            </IconButton>
                        </Dialog.CloseTrigger>
                    </div>
                    <OnlinePlayersList
                        players={players}
                        referenceTime={referenceTime}
                    />
                </Drawer.Content>
            </Drawer.Positioner>
        </Portal>
    );
};

export interface OnlinePlayersProps {
    /** いまオンラインのプレイヤー */
    players: OnlinePlayer[];
    /** 最初から一覧を開いておくか (Storybook 用) */
    defaultOpen?: boolean;
    /** フレーズの基準時刻 (ms)。Storybook などで固定したいときだけ渡す */
    referenceTime?: number;
}

/**
 * ホームのオンライン帯と、押すと下から開くオンライン一覧のシート。
 * 誰もいないときは開くものがないため、押せない帯だけを出す
 */
export const OnlinePlayers = ({
    players,
    defaultOpen,
    referenceTime,
}: OnlinePlayersProps) => {
    if (players.length === 0) {
        return <OnlineStrip players={players} />;
    }

    return (
        // フォーカストラップ・Esc で閉じる・背景のスクロール止めは Drawer (Ark UI の Dialog) に任せる
        <Drawer.Root
            placement="bottom"
            defaultOpen={defaultOpen}
            lazyMount
            unmountOnExit
        >
            <Drawer.Trigger asChild>
                <OnlineStrip players={players} />
            </Drawer.Trigger>
            <OnlinePlayersSheet
                players={players}
                referenceTime={referenceTime}
            />
        </Drawer.Root>
    );
};
