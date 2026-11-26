import type { MapPlayer } from "../-types/world-map";

/** 画面上の位置 (px) を付けたプレイヤー */
export interface ProjectedPlayer {
    player: MapPlayer;
    /** 地図のピクセル座標。ズームが同じなら地図を動かしても変わらない */
    px: number;
    py: number;
}

/** 重なり合うためにまとめて描くプレイヤーのまとまり */
export interface MapPlayerCluster {
    /** React の key。先頭のプレイヤーの UUID */
    key: string;
    /** まとまりに入ったプレイヤー (projected で渡した順) */
    players: MapPlayer[];
    /** まとまりを置くワールド座標 (メンバーの平均) */
    x: number;
    z: number;
}

/** 重なりとみなす中心どうしの距離 (px)。横長の名前チップに合わせ、横を広く取る */
export interface ClusterThreshold {
    dx: number;
    dy: number;
}

/**
 * 画面上で重なるプレイヤーをまとめる。
 * 先に来たプレイヤーをまとまりの基準にし、基準と重なる人を同じまとまりに入れる (貪欲法)。
 * 人数は多くても数十人なので、総当たりで十分速い
 */
export const clusterMapPlayers = (
    projected: ProjectedPlayer[],
    threshold: ClusterThreshold,
): MapPlayerCluster[] => {
    const groups: { anchor: ProjectedPlayer; members: ProjectedPlayer[] }[] =
        [];
    for (const item of projected) {
        const group = groups.find(
            ({ anchor }) =>
                Math.abs(anchor.px - item.px) < threshold.dx &&
                Math.abs(anchor.py - item.py) < threshold.dy,
        );
        if (group) {
            group.members.push(item);
        } else {
            groups.push({ anchor: item, members: [item] });
        }
    }
    return groups.map(({ anchor, members }) => ({
        key: anchor.player.uuid,
        players: members.map((member) => member.player),
        // 1 人だけなら本人の位置、複数なら真ん中に置く
        x:
            members.reduce((sum, member) => sum + member.player.x, 0) /
            members.length,
        z:
            members.reduce((sum, member) => sum + member.player.z, 0) /
            members.length,
    }));
};
