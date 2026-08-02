import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_signed_in/my-page/")({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello "/_signed_in/my-page/"!</div>;
}
