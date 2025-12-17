import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { css } from "../../../styled-system/css";
import { flex } from "../../../styled-system/patterns";
import { authMiddleware } from "../../lib/auth-middleware";

export const Route = createFileRoute("/_signed_in/$")({
    server: {
        middleware: [authMiddleware],
    },
    component: NotFoundPage,
});

function NotFoundPage() {
    const navigate = useNavigate();
    const time = 5;

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate({ to: "/" });
        }, time * 1000);

        // クリーンアップ関数でタイマーをクリア
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div
            className={flex({
                direction: "column",
                align: "center",
                justify: "center",
                minH: "calc(100vh - 80px - var(--sizes-footer-height))",
            })}
        >
            <h1
                className={css({
                    fontSize: "3xl",
                    fontWeight: "bold",
                    textWrap: "balance",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                })}
            >
                お探しのページは
                <br />
                見つかりませんでした
            </h1>

            <p className={css({ fontSize: "md", color: "gray.600" })}>
                {time}秒後に自動的に移動します。
            </p>
        </div>
    );
}
