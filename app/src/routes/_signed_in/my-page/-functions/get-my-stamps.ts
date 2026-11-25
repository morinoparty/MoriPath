import { createServerFn } from "@tanstack/react-start";
import { getMineAuthAccessToken } from "../../../../lib/auth";
import type { MyStamps } from "../-types/stamp";
import { fetchMyStamps } from "./fetch-my-stamps";

/** 自分のスタンプと総数を取得する。取得できなければ null (画面側で非表示にする) */
export const getMyStamps = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<MyStamps | null> => {
        try {
            const tokenResult = await getMineAuthAccessToken(request.headers);

            if (!tokenResult?.accessToken) {
                return null;
            }

            return await fetchMyStamps(tokenResult.accessToken);
        } catch (error) {
            console.warn("スタンプを取得できません:", error);
            return null;
        }
    },
);

export type MyStampsData = Awaited<ReturnType<typeof getMyStamps>>;
