import { Button } from "@morinoparty/chlorophyll-react/components";
import { RotateCw, TriangleAlert } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";

const myPageErrorStyle = sva({
    slots: ["root", "icon", "title", "description", "button"],
    base: {
        root: {
            // TabBar の上の空きに、中央寄せで案内を出す
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3",
            minHeight: "70dvh",
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

export interface MyPageErrorProps {
    /** 再読み込みボタンを押したとき。ルートでは router.invalidate() で loader を取り直す */
    onRetry: () => void;
}

/** マイページの読み込みに失敗したときの表示 */
export const MyPageError = ({ onRetry }: MyPageErrorProps) => {
    const style = myPageErrorStyle();
    return (
        <div className={style.root} role="alert">
            <TriangleAlert className={style.icon} aria-hidden />
            <h1 className={style.title}>マイページを読み込めませんでした</h1>
            <p className={style.description}>
                通信が不安定なか、サーバーが混み合っている可能性があります。
            </p>
            <Button
                intent="secondary"
                onClick={onRetry}
                className={style.button}
            >
                <RotateCw size={16} aria-hidden />
                再読み込み
            </Button>
        </div>
    );
};
