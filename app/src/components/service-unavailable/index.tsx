import { Button } from "@morinoparty/chlorophyll-react/components";
import { CloudOff, RotateCw } from "lucide-react";
import { sva } from "../../../styled-system/css";

const serviceUnavailableStyle = sva({
    slots: ["root", "icon", "title", "description", "button"],
    base: {
        root: {
            // タブバーの無いページなので、画面の中央に案内だけを置く
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3",
            minHeight: "100dvh",
            paddingX: "6",
            textAlign: "center",
        },
        icon: {
            width: "40px",
            height: "40px",
            color: "colorPalette.fg.muted",
        },
        title: {
            textStyle: "display",
            fontSize: "22px",
            color: "colorPalette.fg",
            textWrap: "balance",
        },
        description: {
            fontSize: "sm",
            color: "colorPalette.fg.muted",
            textWrap: "balance",
        },
        button: {
            marginTop: "2",
            gap: "2",
        },
    },
});

export interface ServiceUnavailableProps {
    /** もう一度試すボタンを押したとき。元のページを読み込み直す */
    onRetry: () => void;
}

/** ゲームサーバーのログインサービス (MineAuth) につながらないときの案内 */
export const ServiceUnavailable = ({ onRetry }: ServiceUnavailableProps) => {
    const style = serviceUnavailableStyle();
    return (
        <div className={style.root} role="alert">
            <CloudOff className={style.icon} aria-hidden />
            <h1 className={style.title}>ログインサービスにつながりません</h1>
            <p className={style.description}>
                ゲームサーバーのログインサービスが応答していません。少し待ってから、もう一度お試しください。
            </p>
            <Button
                intent="secondary"
                onClick={onRetry}
                className={style.button}
            >
                <RotateCw size={16} aria-hidden />
                もう一度試す
            </Button>
        </div>
    );
};
