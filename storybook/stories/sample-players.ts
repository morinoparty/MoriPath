import type { SessionData } from "@/lib/server-functions";

/** Storybook で使うプレイヤー。_NIKOMARU を主役に、ほかはこの 4 人だけを使う */
export const samplePlayers = {
    nikomaru: { id: "f8b761ec-4a54-48eb-a040-c5604042bcc9", name: "_NIKOMARU" },
    chocolatt: {
        id: "389b1a68-f647-4dd0-a421-61b6c22fdebe",
        name: "Chocolatt",
    },
    kina1120: { id: "e31f4f1a-9c82-4f8b-b2af-8e1152719f73", name: "kina1120" },
    tututututu201: {
        id: "610fa9d7-4607-4d47-83fd-360f76192723",
        name: "tututututu201",
    },
    hikighaL: { id: "0ebbb0bf-f0d1-41a6-ac80-ca9b2f6df883", name: "hikighaL" },
} as const;

/** Storybook では MC_API_URL を使えないため、アバターは crafthead.net から取得する */
export const craftheadAvatarUrl = (playerId: string, pixelSize: number) =>
    `https://crafthead.net/avatar/${playerId}/${pixelSize}`;

/** _NIKOMARU でログインしている状態のセッション */
export const sampleSession: SessionData = {
    user: {
        id: samplePlayers.nikomaru.id,
        name: samplePlayers.nikomaru.name,
        email: `${samplePlayers.nikomaru.id}@no-reply.morino.party`,
        emailVerified: false,
        image: craftheadAvatarUrl(samplePlayers.nikomaru.id, 128),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    session: {
        id: "session-id",
        userId: samplePlayers.nikomaru.id,
        token: "token",
        expiresAt: new Date(),
        ipAddress: "",
        userAgent: "",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
};
