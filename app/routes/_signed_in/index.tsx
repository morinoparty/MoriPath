import { createFileRoute } from "@tanstack/react-router";
import { LandPlot, Nut } from "lucide-react";
import castlePicture from "/castle-width.png";
import { css, sva } from "../../../styled-system/css";
import { Header } from "../../components/header";
import { CardSquare } from "./-components/card-square";
import { OnlineStatus } from "./-components/online-status";
import { getMyClaims, getOnlinePlayers, getQuests, getVaultBalance } from "./-functions";
import { getUserInfo } from "./-functions/get-userinfo";

export const Route = createFileRoute("/_signed_in/")({
    loader: async () => {
        const [players, balance, userInfo, quests, claims] = await Promise.all([
            getOnlinePlayers(),
            getVaultBalance().catch(() => 0),
            getUserInfo(),
            getQuests().catch(() => null),
            getMyClaims().catch(() => null),
        ]);
        return { players, balance, claims, userInfo, quests };
    },
    component: Home,
});

function Home() {
    const { players, balance, claims, userInfo, quests } =
        Route.useLoaderData();
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
                height: "48px",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
            },
        },
    });
    const style = indexStyle();
    return (
        <div className={style.root}>
            <Header.Builted session={session} />
            <div className={style.title}>
                <h1 className={css({ lineHeight: "1" })}>もりのパーティ</h1>
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
                    height: "280px",
                    objectFit: "cover",
                    objectPosition: "top",
                    aspectRatio: "16/9",
                })}
                width={(300 * 16) / 9}
                height={300}
            />

            <div
                className={css({
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                    padding: "16px",
                })}
            >
                <CardSquare
                    icon={<Nut />}
                    label="どんぐり"
                    value={balance.toLocaleString()}
                />
                <CardSquare
                    icon={<LandPlot />}
                    label="保護ブロック"
                    value={claims?.remainingClaimBlocks?.toLocaleString() ?? "—"}
                />
            </div>
        </div>
    );
}
