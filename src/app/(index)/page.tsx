import { Money } from "~/components/money/money";
import { TopList } from "~/components/top/top-list";

export default async function Home() {
    return (
        <div>
            <TopList />
            <Money />
        </div>
    );
}
