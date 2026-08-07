import { Button } from "@morinoparty/chlorophyll-react/components";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { LandPlot, Nut } from "lucide-react";
import { useRef, useState } from "react";
import { css, sva } from "../../../../styled-system/css";
import { Header } from "../../../components/header";
import { CardSquare } from "../-components/card-square";
import {
    getMyClaims,
    getVaultBalance,
    purchaseClaimBlocks,
} from "../-functions";

export const Route = createFileRoute("/_signed_in/balance-claim/")({
    loader: async () => {
        const [balance, claims] = await Promise.all([
            getVaultBalance().catch(() => 0),
            getMyClaims().catch(() => null),
        ]);
        return {
            balance,
            remainingClaimBlocks: claims?.remainingClaimBlocks ?? null,
        };
    },
    component: BalanceClaimPage,
});

const pageStyle = sva({
    slots: ["root", "title", "section", "form", "input", "error"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
        },
        title: {
            fontSize: "3xl",
            bgColor: "colorPalette.solid",
            color: "colorPalette.contrast",
            padding: "0 24px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
        },
        section: {
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
        },
        form: {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: "12px",
        },
        input: {
            width: "120px",
            padding: "8px 12px",
            fontSize: "md",
            border: "1px solid",
            borderColor: "border",
            borderRadius: "8px",
            bgColor: "bg",
        },
        error: {
            color: "red.9",
            fontSize: "sm",
        },
    },
});

function BalanceClaimPage() {
    const { balance, remainingClaimBlocks } = Route.useLoaderData();
    const { session } = Route.useRouteContext();
    const router = useRouter();
    const [blockCount, setBlockCount] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const num = Number(blockCount);
        if (!Number.isInteger(num) || num <= 0) {
            setError("1以上の整数を入力してください");
            return;
        }
        setIsSubmitting(true);
        try {
            await purchaseClaimBlocks({ data: { blockCount: num } });
            setBlockCount("");
            await router.invalidate();
        } catch (err) {
            setError(err instanceof Error ? err.message : "購入に失敗しました");
        } finally {
            setIsSubmitting(false);
            inputRef.current?.focus();
        }
    };

    const style = pageStyle();

    return (
        <div className={style.root}>
            <Header.Builted session={session} />
            <div className={style.title}>
                <h1 className={css({ lineHeight: "1" })}>残高・保護ブロック</h1>
            </div>
            <div className={style.section}>
                <div
                    className={css({
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "16px",
                    })}
                >
                    <CardSquare
                        icon={<Nut />}
                        label="今の残高（どんぐり）"
                        value={balance.toLocaleString()}
                    />
                    <CardSquare
                        icon={<LandPlot />}
                        label="remainingClaimAmount"
                        value={
                            remainingClaimBlocks !== null
                                ? remainingClaimBlocks.toLocaleString()
                                : "—"
                        }
                    />
                </div>

                <form className={style.form} onSubmit={handleSubmit}>
                    <label
                        className={css({
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                        })}
                    >
                        <span
                            className={css({
                                fontSize: "sm",
                                fontWeight: "medium",
                            })}
                        >
                            購入する保護ブロック数
                        </span>
                        <input
                            ref={inputRef}
                            type="number"
                            min={1}
                            step={1}
                            value={blockCount}
                            onChange={(e) => setBlockCount(e.target.value)}
                            className={style.input}
                            placeholder="例: 100"
                            disabled={isSubmitting}
                        />
                    </label>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "処理中…" : "購入する"}
                    </Button>
                </form>
                {error && <p className={style.error}>{error}</p>}
            </div>
        </div>
    );
}
