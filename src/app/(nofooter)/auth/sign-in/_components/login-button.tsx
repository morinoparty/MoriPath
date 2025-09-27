import { Button } from "@chakra-ui/react";
import { css } from "@/styled-system/css";
import { signIn } from "~/lib/auth";

export const LoginButton = () => {
    return (
        <form
            action={async () => {
                "use server";
                await signIn("MineAuth", { redirectTo: "/" });
            }}
        >
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
