import { IconButton } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { sva } from "../../../styled-system/css";

const subPageBarStyle = sva({
    slots: ["root", "title", "spacer"],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            // 戻るボタンを左右の余白に食い込ませ、アイコンの線を本文の左端にそろえる
            width: "calc(100% + {spacing.4})",
            marginX: "-2",
        },
        title: {
            flex: "1",
            minWidth: "0",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "bold",
            lineHeight: "1.5",
            color: "colorPalette.fg",
        },
        // 見出しを画面の中央に置くため、戻るボタンと同じ幅を右にも空ける
        spacer: {
            flexShrink: "0",
            width: "10",
        },
    },
});

export interface SubPageBarProps {
    /** 画面の見出し */
    title: string;
    /** 戻るボタンの行き先 */
    backTo: string;
}

/** タブバーを出さない下層ページの上部バー。戻るボタンと中央の見出しだけを置く */
export const SubPageBar = ({ title, backTo }: SubPageBarProps) => {
    const style = subPageBarStyle();
    return (
        <header className={style.root}>
            <IconButton asChild variant="ghost" aria-label="もどる">
                <Link to={backTo}>
                    <ChevronLeft />
                </Link>
            </IconButton>
            <h1 className={style.title}>{title}</h1>
            <span className={style.spacer} aria-hidden />
        </header>
    );
};
