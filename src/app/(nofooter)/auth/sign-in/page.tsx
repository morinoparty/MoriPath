import { sva } from "@/styled-system/css";
import { LoginButton } from "~/components/login-button";

const signInStyle = sva({
    slots: ["root", "box", "title", "description"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minH: "calc(100vh - 80px)",
        },
        box: {
            padding: "5rem 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            fontSize: "2xl",
            fontWeight: "bold",
        },
        description: {
            wordBreak: "keep-all",
            overflowWrap: "break-word",
            textAlign: "center",
        },
    },
});

export default function SignInPage() {
    const style = signInStyle();
    return (
        <div className={style.root}>
            <div className={style.box}>
                <h1 className={style.title}>認証が必要です</h1>
                <p className={style.description}>
                    サービスを利用するには、Moripa APIに <wbr />
                    ログインする必要があります。
                </p>
            </div>
            <LoginButton />

            {/* <div className={boxStyle}>
                <h2 className={css({ fontSize: "2xl", fontWeight: "bold" })}>アカウントをお持ちでない場合</h2>

                <p className={css({ fontSize: "lg" })}>
                    お手数ですが、サーバー内で<code>/mineauth register</code>
                    コマンドを実行してアカウントを作成してください。
                </p>
            </div> */}
        </div>
    );
}
