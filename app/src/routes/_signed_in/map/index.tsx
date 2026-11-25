import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { css } from "../../../../styled-system/css";
import { getUserInfo } from "../-functions/get-userinfo";
import { onlinePlayersQueryOptions } from "../-functions/online-players-query";
import { MarkerToggleMenu } from "./-components/marker-toggle-menu";
import { PlayerListSheet } from "./-components/player-list-sheet";
import { TransitButton } from "./-components/transit-button";
import { WorldMapView } from "./-components/world-map-view";
import { WorldSwitcher } from "./-components/world-switcher";
import { buildMapPlayerEntries } from "./-functions/build-map-player-entries";
import { defaultOverlays } from "./-functions/default-overlays";
import { findMapPlayer } from "./-functions/find-map-player";
import { getWorldMapUrlFn } from "./-functions/get-world-map-url";
import { baseMarkersQueryOptions } from "./-functions/map-markers-query";
import { parseMapPin } from "./-functions/map-pin-param";
import { mapSearchSchema } from "./-functions/map-search";
import { useMapPlayers } from "./-functions/use-map-players";
import { useWorldSettings } from "./-functions/use-world-settings";
import type { MapPlayerEntry } from "./-types/map-player-entry";
import type { Vec2, WorldId } from "./-types/world-map";

// 右上に縦に並べる操作ボタン (ワールド切り替え・プレイヤー一覧)
const endControlsStyle = css({
    display: "flex",
    flexDirection: "column",
    gap: "2",
});

export const Route = createFileRoute("/_signed_in/map/")({
    validateSearch: mapSearchSchema,
    // 表示するワールドのマーカーを loader で取るため、ワールドが変わったら loader を呼び直す
    loaderDeps: ({ search }) => ({ world: search.world }),
    loader: async ({ context, deps }) => {
        const [worldMapUrl, userInfo] = await Promise.all([
            getWorldMapUrlFn(),
            // 自分のマーカーを UUID で見分けるため、userinfo の sub を取る。失敗しても地図は出す
            getUserInfo().catch(() => null),
            // 保護範囲以外のマーカーを先に取り、SSR の HTML に載せる (画面の useQuery と同じキャッシュ)。
            // 失敗しても地図は出し、画面側で取り直す
            context.queryClient
                .ensureQueryData(baseMarkersQueryOptions(deps.world))
                .catch(() => null),
        ]);
        return { worldMapUrl, userInfo };
    },
    // squaremap の URL もログイン中のプレイヤーもページを開いているあいだは変わらないため再取得しない
    staleTime: Number.POSITIVE_INFINITY,
    component: MapPage,
});

function MapPage() {
    const { worldMapUrl, userInfo } = Route.useLoaderData();
    const search = Route.useSearch();
    const { session } = Route.useRouteContext();
    const navigate = Route.useNavigate();
    const settings = useWorldSettings(worldMapUrl, search.world);
    // 表示するマーカーの種類は画面の中だけで持つ (URL を汚さない)
    const [overlays, setOverlays] = useState(defaultOverlays);

    // 他の画面から指された地点 (pin=<種類>:<x>,<z>)。名前 (label) はカードに添える
    const pin = useMemo(() => {
        const target = search.pin ? parseMapPin(search.pin) : null;
        return target ? { ...target, label: search.label } : null;
    }, [search.pin, search.label]);

    // ピンがあればそこを、URL に座標があればそこを、無ければワールドのスポーン地点を中心にする
    const center = useMemo((): Vec2 | null => {
        if (pin) {
            return { x: pin.x, z: pin.z };
        }
        if (search.x !== undefined && search.z !== undefined) {
            return { x: search.x, z: search.z };
        }
        if (settings.isError) {
            // スポーン地点を取れなくても地図は出せるよう、原点を中心にする
            return { x: 0, z: 0 };
        }
        return settings.data?.spawn ?? null;
    }, [pin, search.x, search.z, settings.data, settings.isError]);

    // 自分のマーカーを見分けるため、ログイン中のプレイヤーを渡す。
    // セッションの user.id は Minecraft の UUID ではないので、UUID は userinfo の sub から取る
    const selfName = userInfo?.preferred_username ?? session?.user.name ?? null;
    const self = selfName ? { id: userInfo?.sub ?? "", name: selfName } : null;

    const [isPlayerListOpen, setPlayerListOpen] = useState(false);
    // 一覧で選んだ人へ飛ぶたびに増やす。同じ人を選び直したときも、いまの位置へ地図を戻す
    const [recenterKey, setRecenterKey] = useState(0);
    // 位置は地図と同じキャッシュから取る。「プレイヤー」を隠していても、一覧を開いている間は取る
    const players = useMapPlayers(
        worldMapUrl ?? "",
        worldMapUrl !== null && (overlays.players || isPlayerListOpen),
    );
    // 地図に出ていない人 (ほかのサーバー・隠れている人) も一覧に出すため、開いている間だけネットワーク全体の一覧を取る
    const onlinePlayers = useQuery({
        ...onlinePlayersQueryOptions,
        enabled: isPlayerListOpen,
    });
    const playerGroups = useMemo(
        () =>
            buildMapPlayerEntries(
                players.data?.players ?? [],
                onlinePlayers.data ?? null,
                search.world,
            ),
        [players.data, onlinePlayers.data, search.world],
    );

    const selectPlayer = (
        entry: Extract<MapPlayerEntry, { status: "onMap" }>,
    ) => {
        setPlayerListOpen(false);
        // 選んだ時点の位置へ飛ぶだけにし、その後の移動は追わない
        const player = players.data
            ? findMapPlayer(players.data.players, entry.id)
            : null;
        if (!player) return;
        // 飛んだ先にその人が見えるよう、プレイヤーのマーカーを出す
        setOverlays((current) => ({ ...current, players: true }));
        setRecenterKey((current) => current + 1);
        void navigate({
            // ピンは外し、その人がいるワールドの位置を中心にする
            search: {
                world: entry.world,
                x: Math.floor(player.x),
                z: Math.floor(player.z),
            },
            replace: true,
        });
    };

    const changeWorld = (world: WorldId) => {
        // 別のワールドではその座標に意味がないので、座標とピンは外してスポーン地点に戻す
        void navigate({ search: { world }, replace: true });
    };

    const clearPin = () => {
        if (!pin) return;
        // ピンだけを外す。中心の座標は残し、見ている場所が飛ばないようにする
        void navigate({
            search: {
                world: search.world,
                x: pin.x,
                z: pin.z,
            },
            replace: true,
        });
    };

    return (
        <WorldMapView
            baseUrl={worldMapUrl}
            world={search.world}
            center={center}
            overlays={overlays}
            self={self}
            pin={pin}
            onClearPin={clearPin}
            recenterKey={recenterKey}
            startControl={
                <MarkerToggleMenu
                    value={overlays}
                    onValueChange={setOverlays}
                />
            }
            endControl={
                <div className={endControlsStyle}>
                    <WorldSwitcher
                        value={search.world}
                        onValueChange={changeWorld}
                    />
                    <PlayerListSheet
                        groups={playerGroups}
                        isLoading={players.isLoading || onlinePlayers.isLoading}
                        open={isPlayerListOpen}
                        onOpenChange={setPlayerListOpen}
                        onSelectPlayer={selectPlayer}
                    />
                </div>
            }
            bottomEndControl={<TransitButton />}
        />
    );
}
