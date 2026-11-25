import { Field } from "@ark-ui/react/field";
import {
    PlayerAvatar,
    Spinner,
    useMinecraftConfig,
} from "@morinoparty/chlorophyll-react/components";
import { Check, User } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import type { Recipient, RecipientState } from "../../-types/wallet-send";

const recipientPickerStyle = sva({
    slots: [
        "root",
        "label",
        "suggestions",
        "suggestion",
        "ring",
        "suggestionName",
        "control",
        "head",
        "input",
        "status",
        "error",
    ],
    base: {
        // 画面の地の上に置く淡いカード
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
            width: "full",
            padding: "4",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
        },
        label: {
            fontSize: "12px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.muted",
        },
        // 候補が多いときは横にスクロールさせ、カードの高さを変えない
        suggestions: {
            display: "flex",
            gap: "2",
            overflowX: "auto",
            scrollbarWidth: "none",
            // 選択リングの外側が切れないよう、上下に少し余白を取る
            marginX: "-1",
            paddingX: "1",
        },
        suggestion: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1",
            flexShrink: "0",
            width: "16",
            cursor: "pointer",
            borderRadius: "control",
            _focusVisible: {
                outlineWidth: "2px",
                outlineStyle: "solid",
                outlineColor: "colorPalette.focusRing",
                outlineOffset: "2px",
            },
        },
        // 選ばれた人だけ、顔をパレット色の枠で囲む
        ring: {
            display: "flex",
            padding: "3px",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: "transparent",
            borderRadius: "14px",
            "[aria-pressed=true] > &": {
                borderColor: "colorPalette.solid",
            },
        },
        suggestionName: {
            width: "full",
            fontSize: "12px",
            fontWeight: "medium",
            lineHeight: "1.5",
            textAlign: "center",
            color: "colorPalette.fg.muted",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "[aria-pressed=true] > &": {
                fontWeight: "bold",
                color: "colorPalette.fg",
            },
        },
        // 頭・入力・状態アイコンを横に並べたピル型の入力欄
        control: {
            display: "flex",
            alignItems: "center",
            gap: "2",
            height: "11",
            paddingLeft: "2",
            paddingRight: "3.5",
            bg: "colorPalette.bg",
            borderRadius: "full",
            _focusWithin: {
                outlineWidth: "2px",
                outlineStyle: "solid",
                outlineColor: "colorPalette.focusRing",
            },
        },
        // 顔 (または見つかる前の人型アイコン) を 24px の角丸に収める
        head: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: "0",
            width: "6",
            height: "6",
            borderRadius: "6px",
            overflow: "hidden",
            bg: "bg.muted",
            color: "fg.muted",
            "& > svg": { width: "4", height: "4" },
            "& > img": {
                width: "full",
                height: "full",
                imageRendering: "pixelated",
            },
        },
        input: {
            flex: "1",
            minWidth: "0",
            height: "full",
            bg: "transparent",
            fontFamily: "display",
            fontSize: "15px",
            fontWeight: "medium",
            color: "colorPalette.fg",
            outline: "none",
            _placeholder: { color: "colorPalette.fg.muted" },
        },
        status: {
            display: "flex",
            flexShrink: "0",
            color: "colorPalette.solid",
            "& > svg": { width: "4.5", height: "4.5" },
        },
        error: {
            paddingX: "3.5",
            fontSize: "12px",
            fontWeight: "medium",
            color: "fg.error",
        },
    },
});

/** 送り先の欄の頭。見つかった人は顔、それ以外は人型アイコンを出す */
const RecipientHead = ({ recipient }: { recipient: Recipient | null }) => {
    const { avatarUrl } = useMinecraftConfig();
    return recipient ? (
        // 名前を隣に文字で出しているため、画像は飾りとして読み上げない
        <img src={avatarUrl(recipient.id, 32)} alt="" />
    ) : (
        <User aria-hidden />
    );
};

export interface RecipientPickerProps {
    /** 送り先の候補 (いまオンラインの人。自分は含めない) */
    suggestions: readonly Recipient[];
    /** 入力中の Minecraft ID */
    recipientName: string;
    /** 入力中の ID を確かめた結果 */
    recipientState: RecipientState;
    onRecipientNameChange: (name: string) => void;
    onPick: (recipient: Recipient) => void;
    /** 送金中など、変えさせたくないとき */
    disabled?: boolean;
}

/** 送り先を選ぶカード。候補の顔から選ぶか、Minecraft ID を入力する */
export const RecipientPicker = ({
    suggestions,
    recipientName,
    recipientState,
    onRecipientNameChange,
    onPick,
    disabled = false,
}: RecipientPickerProps) => {
    const style = recipientPickerStyle();
    const found =
        recipientState.status === "found" ? recipientState.recipient : null;

    return (
        <Field.Root
            className={style.root}
            invalid={recipientState.status === "error"}
            disabled={disabled}
        >
            <Field.Label className={style.label}>送り先</Field.Label>
            {suggestions.length > 0 && (
                <div className={style.suggestions}>
                    {suggestions.map((player) => (
                        <button
                            key={player.id}
                            type="button"
                            className={style.suggestion}
                            aria-pressed={found?.id === player.id}
                            disabled={disabled}
                            onClick={() => onPick(player)}
                        >
                            <span className={style.ring}>
                                <PlayerAvatar
                                    playerId={player.id}
                                    playerName={player.name}
                                    decorative
                                />
                            </span>
                            <span className={style.suggestionName}>
                                {player.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            <div className={style.control}>
                <span className={style.head}>
                    <RecipientHead recipient={found} />
                </span>
                <Field.Input
                    className={style.input}
                    value={recipientName}
                    onChange={(event) =>
                        onRecipientNameChange(event.currentTarget.value)
                    }
                    placeholder="Minecraft ID"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={16}
                />
                <span className={style.status}>
                    {recipientState.status === "checking" && (
                        <Spinner size="sm" aria-label="確認中" />
                    )}
                    {recipientState.status === "found" && (
                        <Check aria-label="見つかりました" />
                    )}
                </span>
            </div>
            {recipientState.status === "error" && (
                <Field.ErrorText className={style.error}>
                    {recipientState.message}
                </Field.ErrorText>
            )}
        </Field.Root>
    );
};
