import { Greeting } from "~/components/top/greeting";
import { JoinPlayerInfo } from "~/components/top/join-player-info";
export const TopList = () => {
    return (
        <div>
            <Greeting />

            <JoinPlayerInfo />
        </div>
    );
};
