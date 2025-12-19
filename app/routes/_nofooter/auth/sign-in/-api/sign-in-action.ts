import { createServerFn } from "@tanstack/react-start";
import { auth } from "../../../../../lib/auth";

export const signInAction = createServerFn().handler(async () => {
    const result = await auth.api.signInWithOAuth2({
        body: {
            providerId: "MineAuth",
            callbackURL: "/",
        },
    });
    const redirectUrl = typeof result === "string" ? result : result.url;
    return { redirectUrl };
});
