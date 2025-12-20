import { createFileRoute } from "@tanstack/react-router";
import castlePicture from "/castle-width.png";
import { css, sva } from "../../../styled-system/css";
import { Header } from "../../components/header";
import { LoginStatus } from "../../components/login-status";
import { Notification } from "../../components/notification";
import { OnlineStatus } from "../../components/online-status";
import { ColorModeButton } from "../../components/ui/color-mode";
import { PaletteButton } from "../../components/ui/palette";
import { getOnlinePlayers } from "../../lib/server-functions";

export const Route = createFileRoute("/_signed_in/")({
    loader: async () => {
        const players = await getOnlinePlayers();
        return { players };
    },
    component: Home,
});

function Home() {
    const { players } = Route.useLoaderData();
    const { session } = Route.useRouteContext();

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
            <Header.Builted session={session} />
            <div className={style.title}>
                <h1>もりのパーティ</h1>
            </div>
            <OnlineStatus.Root players={players}>
                <OnlineStatus.Count />
                <OnlineStatus.PlayerList />
            </OnlineStatus.Root>
            <img
                src={castlePicture}
                alt="That is a castle that is built by Itachi"
                className={css({
                    width: "100%",
                    height: "35vh",
                    objectFit: "cover",
                    objectPosition: "top",
                    aspectRatio: "16/9",
                })}
                width={(300 * 16) / 9}
                height={300}
            />
        </div>
    );
}
