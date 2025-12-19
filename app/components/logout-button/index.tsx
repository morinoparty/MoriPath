import { Button, HStack } from "@chakra-ui/react";
import { createServerFn } from "@tanstack/react-start";
import { LogOut } from "lucide-react";
import { auth } from "../../lib/auth";

// サーバー関数としてサインアウトを実行
const signOutAction = createServerFn().handler(async ({ request }) => {
    await auth.api.signOut({
        headers: request.headers,
    });
});

export const LogOutButton = () => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await signOutAction();
        window.location.reload();
    };

    return (
        <form onSubmit={handleSubmit}>
            <Button type="submit">
                <HStack gap="2">
                    <LogOut />
                    <div>ログアウト</div>
                </HStack>
            </Button>
        </form>
    );
};
