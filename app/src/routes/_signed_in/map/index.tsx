import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MarkerToggleMenu } from "./-components/marker-toggle-menu";
import { WorldMapView } from "./-components/world-map-view";
import { WorldSwitcher } from "./-components/world-switcher";
import { defaultOverlays } from "./-functions/default-overlays";
import { getWorldMapUrlFn } from "./-functions/get-world-map-url";
import { mapSearchSchema } from "./-functions/map-search";
import { useWorldSettings } from "./-functions/use-world-settings";
import type { Vec2, WorldId } from "./-types/world-map";

export const Route = createFileRoute("/_signed_in/map/")({
    validateSearch: mapSearchSchema,
    // squaremap の URL は deploy ごとにしか変わらないため再取得しない
    loader: async () => ({ worldMapUrl: await getWorldMapUrlFn() }),
    staleTime: Number.POSITIVE_INFINITY,
    component: MapPage,
});

function MapPage() {
    const { worldMapUrl } = Route.useLoaderData();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const settings = useWorldSettings(worldMapUrl, search.world);
    // 表示するマーカーの種類は画面の中だけで持つ (URL を汚さない)
    const [overlays, setOverlays] = useState(defaultOverlays);

    // URL に座標があればそこを、無ければワールドのスポーン地点を中心にする
    const center = useMemo((): Vec2 | null => {
        if (search.x !== undefined && search.z !== undefined) {
            return { x: search.x, z: search.z };
        }
        if (settings.isError) {
            // スポーン地点を取れなくても地図は出せるよう、原点を中心にする
            return { x: 0, z: 0 };
        }
        return settings.data?.spawn ?? null;
    }, [search.x, search.z, settings.data, settings.isError]);

    const changeWorld = (world: WorldId) => {
        // 別のワールドではその座標に意味がないので、座標は外してスポーン地点に戻す
        void navigate({ search: { world }, replace: true });
    };

    return (
        <WorldMapView
            baseUrl={worldMapUrl}
            world={search.world}
            center={center}
            overlays={overlays}
            startControl={
                <MarkerToggleMenu
                    value={overlays}
                    onValueChange={setOverlays}
                />
            }
            endControl={
                <WorldSwitcher
                    value={search.world}
                    onValueChange={changeWorld}
                />
            }
        />
    );
}
