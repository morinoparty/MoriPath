import { sva } from "@/styled-system/css";
import { LogOutButton } from "~/components/logout-button";
import { OnlineStatus } from "~/components/online-status";

export default function Home() {
    const indexStyle = sva({
        slots: ["root", "title"],
        base: {
            root: {
                display: "flex",
                flexDirection: "column",
            },
            title: {
                fontSize: "3xl",
                bgColor: "var(--chakra-colors-color-palette-500)",
                color: "var(--chakra-colors-color-palette-50)",
                padding: "0 24px",
                height: "56px",
                fontWeight: "bold",
            },
        },
    });
    const style = indexStyle();
    return (
        <div className={style.root}>
            <div className={style.title}>
                <h1>もりのパーティ</h1>
            </div>
            <OnlineStatus />
        </div>
    );
}
