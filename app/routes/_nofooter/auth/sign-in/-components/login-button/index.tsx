import { Button } from "@chakra-ui/react";
import { createServerFn } from "@tanstack/react-start";
import { css } from "../../../../../../../styled-system/css";
import { auth } from "../../../../../../lib/auth";

// サーバー関数としてサインインを実行
const signInAction = createServerFn().handler(async () => {
    const result = await auth.api.signInWithOAuth2({
        body: {
            providerId: "MineAuth",
            callbackURL: "/",
        },
    });
    const redirectUrl = typeof result === "string" ? result : result.url;
    return { redirectUrl };
});

export const LoginButton = () => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await signInAction();
        if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Button
                type="submit"
                size="xl"
                className={css({
                    width: "100%",
                })}
            >
                MineAuthでログイン
            </Button>
        </form>
    );
};
