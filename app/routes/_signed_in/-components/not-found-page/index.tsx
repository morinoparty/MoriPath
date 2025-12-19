import { css } from "../../../../../styled-system/css";
import { flex } from "../../../../../styled-system/patterns";
import { useAutoRedirect } from "../../-functions/use-auto-redirect";

interface NotFoundPageProps {
    time?: number;
}

export function NotFoundPage({ time = 5 }: NotFoundPageProps) {
    useAutoRedirect(time, "/");

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
