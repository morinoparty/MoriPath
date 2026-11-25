import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { findPlayer } from "../../../../../lib/player-helpers";
import type { ResolveRecipientResult } from "../-types/wallet-send";
import { getWalletAuth, isSelf } from "./wallet-auth";

// Minecraft ID は英数字とアンダースコアの 3〜16 文字
export const MINECRAFT_ID_PATTERN = /^\w{3,16}$/;

const resolveRecipientInputSchema = z.object({
    name: z.string().regex(MINECRAFT_ID_PATTERN),
});

/** 入力された Minecraft ID を mc-api で引き、送り先の UUID と正しい表記の名前を返す */
export const resolveRecipient = createServerFn()
    .validator(resolveRecipientInputSchema)
    .handler(
        // oxlint-disable-next-line typescript/no-explicit-any -- request は createServerFn のコンテキストで型が付かない
        async ({ data, request }: any): Promise<ResolveRecipientResult> => {
            const { name } = data as z.infer<
                typeof resolveRecipientInputSchema
            >;
            try {
                // 自分の確認と mc-api の検索は互いに待たずに進める
                const [{ self }, player] = await Promise.all([
                    getWalletAuth((request as Request).headers),
                    findPlayer(name),
                ]);
                if (!player) {
                    return { ok: false, reason: "not-found" };
                }
                if (isSelf(self, player)) {
                    return { ok: false, reason: "self" };
                }
                return { ok: true, recipient: player };
            } catch (error) {
                console.error("送り先の検索に失敗しました:", error);
                return { ok: false, reason: "error" };
            }
        },
    );
