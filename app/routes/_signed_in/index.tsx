import { createFileRoute } from "@tanstack/react-router";
import castlePicture from "/castle-width.png";
import { css, sva } from "../../../styled-system/css";
import { Header } from "../../components/header";
import { OnlineStatus } from "../../components/online-status";
import { getOnlinePlayers } from "./-functions/get-online-players";

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
            <Header session={session} />
            <div className={style.title}>
                <h1>もりのパーティ</h1>
            </div>
            <OnlineStatus players={players} />
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
