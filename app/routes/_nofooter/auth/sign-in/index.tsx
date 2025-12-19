import { createFileRoute, Link } from "@tanstack/react-router";
import castlePicture from "/castle-tall.png";
import { sva } from "../../../../../styled-system/css";
import { LoginButton } from "./-components/login-button";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "../../../../lib/auth";

export const Route = createFileRoute("/_nofooter/auth/sign-in/")({
    component: SignInPage,
});

const signInAction = createServerFn().handler( async () => {
    const result = await auth.api.signInWithOAuth2({
        body: {
            providerId: "MineAuth", 
            callbackURL: "/",
        },
    });
    const redirectUrl = typeof result === "string" ? result : result.url;
    return { redirectUrl };
});

const handleLogin = async () => {
    const result = await signInAction();
    if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
    }
};

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

function SignInPage() {
    const style = signInStyle();
    return (
        <div className={style.root}>
            <img
                src={castlePicture}
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
                    <LoginButton onClick={handleLogin} />
                    <p className={style.terms}>
                        ログインすることで、
                        <Link className={style.termsLink} to="/terms">
                            利用規約
                        </Link>
                        に同意します
                    </p>
                </div>
            </div>
        </div>
    );
}
