import Link from "next/link";
import castlePicture from "@/public/image.png";
import { sva } from "@/styled-system/css";
import { LoginButton } from "./_components/login-button";

const signInStyle = sva({
    slots: [
        "root",
        "castlePicture",
        "box",
        "contentBox",
        "title",
        "description",
        "terms",
        "termsBox",
        "termsLink",
    ],
    base: {
        root: {
            display: "flex",
            height: "100vh",
            flexDirection: "column",
            gap: "0",
        },
        castlePicture: {
            width: "100%",
            height: "100%", // 残った部分を全て画像が占めるようにする
            objectFit: "cover",
            objectPosition: "top",
        },
        box: {
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            width: "100%",
            padding: "2rem",
            paddingBottom: "5rem",
            minHeight: "280px", // boxに固定の高さを設定
            flexShrink: 0, // boxのサイズを固定
        },
        contentBox: {
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            width: "100%",
        },
        title: {
            fontSize: "2xl",
            fontWeight: "bold",
        },
        description: {
            fontSize: "md",
        },
        termsBox: {
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "100%",
        },
        terms: {
            color: "var(--chakra-colors-fg-subtle)",
            fontSize: "sm",
            textAlign: "center",
        },
        termsLink: {
            fontSize: "sm",
            textAlign: "center",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            textDecorationStyle: "dotted",
            textDecorationColor: "var(--chakra-colors-fg-subtle)",
        },
    },
});

export default function SignInPage() {
    const style = signInStyle();
    return (
        <div className={style.root}>
            <img
                src={castlePicture.src}
                alt="That is a castle that is built by Itachi"
                className={style.castlePicture}
                width={1000}
                height={600}
            />
            <div className={style.box}>
                <div className={style.contentBox}>
                    <h1 className={style.title}>もりパスへようこそ</h1>
                    <p className={style.description}>
                        もりぱすを使うと、さまざまなもりのパーティの機能を使うことができます。
                    </p>
                </div>
                <div className={style.termsBox}>
                    <LoginButton />
                    <p className={style.terms}>
                        ログインすることで、
                        <Link className={style.termsLink} href="/terms">
                            利用規約
                        </Link>
                        に同意します
                    </p>
                </div>
            </div>
        </div>
    );
}
