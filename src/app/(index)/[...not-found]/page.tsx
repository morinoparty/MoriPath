"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { flex } from "@/styled-system/patterns";
import { css } from "@/styled-system/css";

export default function Page() {
    const router = useRouter();
    const time = 5;

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/");
        }, time * 1000);

        // クリーンアップ関数でタイマーをクリア
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div
            className={flex({
                direction: "column",
                align: "center",
                justify: "center",
                minH: "calc(100vh - var(--sizes-header-height) * 2 - var(--sizes-footer-height))",
            })}
        >
            <h1 className={css({ fontSize: "3xl", fontWeight: "bold", textWrap: "balance", textAlign: "center", display: "flex", justifyContent: "center" })}>
                お探しのページは、<br/>
                見つかりませんでした
            </h1>

            <p className={css({ fontSize: "md", color: "gray.600" })}>
                {time}秒後に自動的に移動します。
            </p>

        </div>
    );
}
