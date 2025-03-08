"use client";
import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";
import { useRouter } from "next/navigation";

export default function ServiceUnavailable() {
    const router = useRouter();
    return (
        <div
            className={flex({
                direction: "column",
                align: "center",
                justify: "center",
                minH: "calc(100vh - 80px)",
            })}
        >
            <h1 className={css({ fontSize: "3xl", fontWeight: "bold" })}>
                サービス利用不可
            </h1>
            <p className={css({ fontSize: "lg" })}>
                申し訳ありませんが、現在サーバーが応答していません。
            </p>
            <p className={css({ fontSize: "md", color: "gray.600" })}>
                しばらく経ってから再度お試しください。
            </p>
            <button
                type="button"
                onClick={() => router.push("/")}
                className={css({
                    mt: "4",
                    px: "4",
                    py: "2",
                    color: "white",
                    rounded: "md",
                    bg: "var(--colors-primary)",
                    _hover: {
                        bgColor: "var(--colors-primary90)",
                    },
                })}
            >
                再読み込み
            </button>
        </div>
    );
}
