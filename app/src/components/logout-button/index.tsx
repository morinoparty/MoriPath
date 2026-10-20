import { Button } from "@morinoparty/chlorophyll-react/components";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { LogOut } from "lucide-react";
import { css } from "../../../styled-system/css";
import { getAuth } from "../../lib/auth";

// サーバー関数としてサインアウトを実行
const signOutAction = createServerFn().handler(async () => {
    // getRequest() はリクエストコンテキストに依存するため await より前に呼ぶ
    const { headers } = getRequest();
    const auth = await getAuth();
    await auth.api.signOut({
        headers,
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
            <Button type="submit" className={css({ gap: "2" })}>
                <LogOut />
                <div>ログアウト</div>
            </Button>
        </form>
    );
};
