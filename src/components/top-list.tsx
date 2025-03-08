import { css } from "@/styled-system/css";
import { PlayerList } from "~/components/player-list";

export const TopList = () => {
    return (
        <div>
            <h1
                className={css({
                    fontSize: "3xl",
                    fontWeight: "bold",
                    padding: "16px",
                })}
            >
                {(() => {
                    const hour = new Date().getHours();
                    if (6 <= hour && hour < 10) return "おはよう 🌅"; // 6-10
                    if (10 <= hour && hour < 18) return "こんにちは ☀️"; // 10-18
                    return "こんばんは 🌙"; // それ以外は「こんばんは」
                })()}
            </h1>

            <PlayerList />
        </div>
    );
};
