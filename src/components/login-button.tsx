import { Button } from "@chakra-ui/react";
import { signIn } from "~/lib/auth";

export const LoginButton = () => {
    return (
        <form
            action={async () => {
                "use server";
                await signIn("MineAuth", { redirectTo: "/" });
            }}
        >
            <Button type="submit" size="lg">
                <span>Moripa APIにログイン</span>
            </Button>
        </form>
    );
};
