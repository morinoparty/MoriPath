import { css } from "@/styled-system/css";
import { PlayerList } from "~/components/player-list";

export const TopList = () => {
    return (
        <div>
            <h1
                className={css({
                    fontSize: "3xl",
                    fontWeight: "bold",
                })}
            >
                こんばんは
            </h1>

            <PlayerList />
        </div>
    );
};
