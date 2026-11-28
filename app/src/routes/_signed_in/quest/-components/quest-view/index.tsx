import { RefreshCw } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import { HomeHeader } from "../../../../../components/home-header";
import type { SessionData } from "../../../../../lib/server-functions";
import { rerollBlockedReason } from "../../-functions/quest-actions";
import type { OrderableDifficulty, QuestBoard } from "../../-types/quest";
import { DifficultyPicker } from "../difficulty-picker";
import { QuestCard } from "../quest-card";
import { RerollConfirmDialog } from "../reroll-confirm-dialog";

const questViewStyle = sva({
    slots: [
        "root",
        "body",
        "title",
        "section",
        "sectionHeader",
        "sectionTitle",
        "count",
        "list",
        "reroll",
        "rerollIcon",
        "note",
        "message",
    ],
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
            gap: "4",
            // 左右はヘッダー・TabBar と同じ 16px にそろえる
            paddingX: "4",
            paddingTop: "2",
        },
        title: {
            fontSize: "28px",
            fontWeight: "bold",
            lineHeight: "1.4",
            color: "colorPalette.fg",
        },
        section: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
        sectionHeader: {
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
        },
        sectionTitle: {
            textStyle: "lg",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        count: {
            textStyle: "sm",
            fontWeight: "bold",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg.muted",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
            listStyle: "none",
        },
        // 主役はクエストなので、リロールは控えめなピルにする
        reroll: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5",
            alignSelf: "center",
            height: "40px",
            paddingX: "5",
            border: "none",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
            textStyle: "sm",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.15s",
            _hover: { bg: "colorPalette.surface.hover" },
            _disabled: {
                cursor: "not-allowed",
                opacity: "0.5",
                _hover: { bg: "colorPalette.surface.subtle" },
            },
            _focusVisible: {
                outline: "2px solid",
                outlineColor: "colorPalette.9",
                outlineOffset: "2px",
            },
        },
        rerollIcon: {
            width: "4",
            height: "4",
        },
        note: {
            marginTop: "-2",
            textStyle: "xs",
            color: "colorPalette.fg.muted",
            textAlign: "center",
        },
        message: {
            paddingY: "8",
            textAlign: "center",
            textStyle: "sm",
            color: "colorPalette.fg.muted",
        },
    },
});

export interface QuestViewProps {
    session: SessionData;
    /** その日のクエストの状況。取得できなければ null */
    board: QuestBoard | null;
    /** 受けている最中の難易度 */
    orderingDifficulty: OrderableDifficulty | null;
    isRerolling: boolean;
    isConfirmingReroll: boolean;
    onOrder: (difficulty: OrderableDifficulty) => void;
    onRequestReroll: () => void;
    onCancelReroll: () => void;
    onConfirmReroll: () => void;
}

/** クエストのページの見た目。データの取得はルートの loader が行う */
export const QuestView = ({
    session,
    board,
    orderingDifficulty,
    isRerolling,
    isConfirmingReroll,
    onOrder,
    onRequestReroll,
    onCancelReroll,
    onConfirmReroll,
}: QuestViewProps) => {
    const style = questViewStyle();

    return (
        <main className={style.root}>
            <HomeHeader.Builted session={session} />
            <div className={style.body}>
                <h1 className={style.title}>クエスト</h1>
                {board === null ? (
                    <p className={style.message}>
                        クエストを読み込めませんでした
                    </p>
                ) : board.ordered ? (
                    <OrderedQuests
                        board={board}
                        isRerolling={isRerolling}
                        isConfirmingReroll={isConfirmingReroll}
                        onRequestReroll={onRequestReroll}
                        onCancelReroll={onCancelReroll}
                        onConfirmReroll={onConfirmReroll}
                    />
                ) : (
                    <section className={style.section}>
                        <h2 className={style.sectionTitle}>
                            きょうの難易度をえらぶ
                        </h2>
                        <DifficultyPicker
                            // ゲーム内と同じく、サーバーにいるときだけ受けられる
                            disabledReason={
                                board.online
                                    ? null
                                    : "サーバーにいるときだけ受けられます"
                            }
                            orderingDifficulty={orderingDifficulty}
                            onSelect={onOrder}
                        />
                    </section>
                )}
            </div>
        </main>
    );
};

interface OrderedQuestsProps {
    board: QuestBoard;
    isRerolling: boolean;
    isConfirmingReroll: boolean;
    onRequestReroll: () => void;
    onCancelReroll: () => void;
    onConfirmReroll: () => void;
}

/** 受けているクエストの一覧と、リロールの操作 */
const OrderedQuests = ({
    board,
    isRerolling,
    isConfirmingReroll,
    onRequestReroll,
    onCancelReroll,
    onConfirmReroll,
}: OrderedQuestsProps) => {
    const style = questViewStyle();
    const completedCount = board.quests.filter(
        (quest) => quest.status === "completed",
    ).length;
    const blockedReason = rerollBlockedReason(board);

    return (
        <>
            <div className={style.sectionHeader}>
                <h2 className={style.sectionTitle}>きょうのクエスト</h2>
                <span className={style.count}>
                    {completedCount} / {board.quests.length}
                </span>
            </div>
            <ul className={style.list}>
                {board.quests.map((quest) => (
                    <li key={quest.slot}>
                        <QuestCard quest={quest} />
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className={style.reroll}
                disabled={blockedReason !== null || isRerolling}
                onClick={onRequestReroll}
            >
                <RefreshCw className={style.rerollIcon} aria-hidden />
                リロール (残り {board.rerollCharges} 回)
            </button>
            {blockedReason && <p className={style.note}>{blockedReason}</p>}
            <RerollConfirmDialog
                open={isConfirmingReroll}
                rerollCharges={board.rerollCharges}
                isRerolling={isRerolling}
                onConfirm={onConfirmReroll}
                onCancel={onCancelReroll}
            />
        </>
    );
};
