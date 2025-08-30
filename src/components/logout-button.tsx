import { Button, HStack } from "@chakra-ui/react";
import { LogOut } from "lucide-react";
import { signOut } from "~/lib/auth";

export const LogOutButton = () => {
    return (
        <form
            action={async () => {
                "use server";
                await signOut();
            }}
        >
            <Button type="submit">
                <HStack gap="2">
                    <LogOut />
                    <div>ログアウト</div>
                </HStack>
            </Button>
        </form>
    );
};
