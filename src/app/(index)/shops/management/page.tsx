import { ShopCard } from "@/src/components/shops/management/shop-card";
import { css } from "@/styled-system/css";
import { type ExtendedSession, auth } from "~/lib/auth";

export default async function Home() {
    const session = await auth();
    const sessionData = session as ExtendedSession;
    const uuid = sessionData?.user?.id;

    const res = await fetch(`${process.env.MAIN_SERVER_URL}/api/v1/plugins/quickshop-hikari/users/${uuid}/shops`);
    const data = await res.json<number[]>();

    return (
        <>
            <ShopManagementHeader />
            <div
                className={css({
                    display: "flex",
                    width: "100%",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "10px",
                })}
            >
                {data.map((shopId) => (
                    <ShopCard key={shopId} shopId={shopId} />
                ))}
            </div>
        </>
    );
}

const ShopManagementHeader = () => {
    return (
        <div
            className={css({
                display: "inline-flex",
                padding: "16px 0",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
            })}
        >
            <div
                className={css({
                    color: "#539676",
                    textAlign: "right",
                    fontFamily: 'var(--typography-family-title, "Plus Jakarta Sans")',
                    fontSize: "2xl",
                    fontStyle: "normal",
                    fontWeight: "var(--typography-weight-bold, 700)",
                    lineHeight: "32px /* 133.333% */",
                })}
            >
                {" "}
                ショップ管理
            </div>
        </div>
    );
};
