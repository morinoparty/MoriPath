import { createFileRoute } from "@tanstack/react-router";
import { MyShopsView } from "./-components/my-shops-view";
import { getMyShops } from "./-functions/get-my-shops";

export const Route = createFileRoute("/_signed_in/my-page/shops/")({
    loader: async ({ context }) => {
        // 取れなくても画面は出し、読み込めなかった旨を一覧の場所に出す
        const shops = await getMyShops().catch(() => null);
        // 持ち主はすべて本人なので、UUID の先頭の仮の名前をセッションの名前に置き換える
        const myName = context.session?.user.name;
        return {
            shops:
                shops && myName
                    ? shops.map((shop) =>
                          shop.owner
                              ? {
                                    ...shop,
                                    owner: { ...shop.owner, name: myName },
                                }
                              : shop,
                      )
                    : shops,
        };
    },
    component: MyShopsPage,
});

function MyShopsPage() {
    const { shops } = Route.useLoaderData();
    return <MyShopsView shops={shops} />;
}
