import { css } from "@/styled-system/css";
import type { ShopData } from "~/lib/types";

type props = {
    shopId: number;
};

export const ShopCard = async ({ shopId }: props) => {
    const res = await fetch(`${process.env.MAIN_SERVER_URL}/api/v1/plugins/quickshop-hikari/shops/${shopId}`);
    const data = await res.json<ShopData>();

    const display: { text: string; tag: string }[] = [
        { text: `値段: ${data.price} / ${data.stackingAmount}個`, tag: "price" },
        { text: `在庫: ${data.remaining} × ${data.stackingAmount}個`, tag: "stock" },
        { text: `座標: ${data.location.x}, ${data.location.y}, ${data.location.z}`, tag: "location" },
    ];

    return (
        <>
            <div
                className={css({
                    width: "100%",
                    height: "100%",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--colors-border-default)",
                    background: "#FFF",
                })}
            >
                <div
                    className={css({
                        display: "inline-flex",
                        height: "32px",
                        alignItems: "center",
                        gap: "24px",
                        flexShrink: 0,
                    })}
                >
                    <img
                        className={css({
                            width: "24px",
                            height: "24px",
                            aspectRatio: "1/1",
                        })}
                        src={`https://assets.mcasset.cloud/1.21.4/assets/minecraft/textures/${data.item.type.type.toLowerCase()}/${data.item.type.name.toLowerCase()}.png`}
                        alt="shop"
                    />
                    <div>
                        {data.item.meta.displayName.text !== ""
                            ? removeColorTags(data.item.meta.displayName.text)
                            : data.item.type.name}
                    </div>
                </div>
                <div
                    className={css({
                        display: "flex",
                        width: "100%",
                        height: "18px",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexShrink: 0,
                    })}
                >
                    {display.map((item) => (
                        <div
                            className={css({
                                textAlign: "center",
                                fontSize: "xs",
                                fontStyle: "normal",
                                fontWeight: "500",
                                lineHeight: "18px /* 150% */",
                                color: item.tag === "stock" && data.remaining === 0 ? "red" : "",
                            })}
                            key={item.tag}
                        >
                            {item.text}
                        </div>
                    ))}
                </div>
                {/*<div*/}
                {/*    className={css({*/}
                {/*        width: "16px",*/}
                {/*        height: "80px",*/}
                {/*        flexShrink: 0,*/}
                {/*        borderRadius: "8px 0px 0px 8px",*/}
                {/*        borderTop: "1px solid var(--colors-border-default)",*/}
                {/*        borderBottom: "1px solid var(--colors-border-default)",*/}
                {/*        borderLeft: "1px solid var(--colors-border-default)",*/}
                {/*        background: data.mode === "SELL" ? "red": "green",*/}
                {/*    })}*/}
                {/*></div>*/}
            </div>
        </>
    );
};

const removeColorTags = (text: string): string => {
    // <#RRGGBB>や</#RRGGBB>、<gold>や</gold>などのタグを削除
    return text.replace(/<[/#]?(?:#[0-9a-fA-F]{6}|[a-zA-Z]+)>/g, "");
};
