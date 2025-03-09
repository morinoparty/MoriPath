import { Money } from "~/components/money/money";
import { Shops } from "~/components/shops/shops";
import { TopList } from "~/components/top/top-list";

export default async function Home() {
    return (
        <div>
            <TopList />
            <Money />
            <Shops />
        </div>
    );
}
