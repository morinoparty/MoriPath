import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";
import { LoginButton } from "~/components/login-button";

export default function SignInPage() {
    return (
        <div
            className={flex({
                direction: "column",
                align: "center",
                minH: "calc(100vh - 80px)",
            })}
        >
            <div className={boxStyle}>
                <h1 className={css({ fontSize: "2xl", fontWeight: "bold" })}>
                    認証が必要です
                </h1>

                <p className={css({ fontSize: "lg" })}>
                    サービスを利用するには、Moripa
                    APIにログインする必要があります。
                </p>
            </div>
            <LoginButton />

            <div className={boxStyle}>
                <h2 className={css({ fontSize: "2xl", fontWeight: "bold" })}>
                    アカウントをお持ちでない場合
                </h2>

                <p className={css({ fontSize: "lg" })}>
                    お手数ですが、サーバー内で<code>/mineauth register</code>
                    コマンドを実行してアカウントを作成してください。
                </p>
            </div>
        </div>
    );
}

const boxStyle = flex({
    padding: "5rem 0",
    direction: "column",
    align: "center",
    justify: "center",
});
