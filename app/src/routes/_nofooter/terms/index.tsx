import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_nofooter/terms/")({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello "/_nofooter/auth/sign-in/terms/"!</div>;
}
