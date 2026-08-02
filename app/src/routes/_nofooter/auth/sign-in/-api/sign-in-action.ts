import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../../../lib/auth";

export const signInAction = createServerFn().handler(async () => {
    const auth = await getAuth();
    const result = await auth.api.signInWithOAuth2({
        body: {
            providerId: "MineAuth",
            callbackURL: "/",
            scopes: ["openid", "profile", "email", "roles"],
        },
    });
    const redirectUrl = typeof result === "string" ? result : result.url;
    return { redirectUrl };
});
