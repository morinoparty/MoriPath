import {
    Button,
    PlayerAvatar,
} from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { CircleCheck } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import { formatNumber } from "../../../../../../lib/format-number";
import type { SendResult as SendResultData } from "../../-types/wallet-send";

const sendResultStyle = sva({
    slots: [
        "root",
        "icon",
        "title",
        "card",
        "recipient",
        "name",
        "amount",
        "unit",
        "balance",
        "actions",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5",
            // 残りの高さを占め、ボタンを送る画面と同じ下端に置く
            flex: "1",
            width: "full",
            paddingTop: "6",
        },
        icon: {
            width: "14",
            height: "14",
            color: "colorPalette.solid",
        },
        title: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        // 送った内容は画面の地の上の淡いカードにまとめる
        card: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2",
            width: "full",
            padding: "5",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
        },
        recipient: {
            display: "flex",
            alignItems: "center",
            gap: "2",
        },
        name: {
            fontFamily: "display",
            fontSize: "18px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        amount: {
            fontSize: "36px",
            fontWeight: "bold",
            lineHeight: "1.25",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg",
        },
        unit: {
            marginLeft: "1",
            fontSize: "14px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        balance: {
            fontSize: "14px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        actions: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
            width: "full",
            marginTop: "auto",
        },
    },
});

export interface SendResultProps {
    result: SendResultData;
    /** 同じ画面で続けて送るとき */
    onSendAnother: () => void;
}

/** 送り終わったときの表示。送った相手・金額と、送金後の残高を出す */
export const SendResult = ({ result, onSendAnother }: SendResultProps) => {
    const style = sendResultStyle();
    return (
        <section className={style.root} aria-live="polite">
            <CircleCheck className={style.icon} aria-hidden />
            <h2 className={style.title}>送りました</h2>
            <div className={style.card}>
                <div className={style.recipient}>
                    <PlayerAvatar
                        playerId={result.recipient.id}
                        playerName={result.recipient.name}
                        size="sm"
                        decorative
                    />
                    <span className={style.name}>{result.recipient.name}</span>
                </div>
                <p className={style.amount}>
                    {formatNumber(result.amount)}
                    <span className={style.unit}>どんぐり</span>
                </p>
                {/* 送金 API の応答が読めず残高が分からないときは、残高の行を出さない */}
                {result.balance !== null && (
                    <p className={style.balance}>
                        残高 {formatNumber(result.balance)} どんぐり
                    </p>
                )}
            </div>
            <div className={style.actions}>
                <Button asChild size="xl" intent="primary">
                    <Link to="/my-page">マイページへ</Link>
                </Button>
                <Button size="xl" intent="secondary" onClick={onSendAnother}>
                    続けて送る
                </Button>
            </div>
        </section>
    );
};
