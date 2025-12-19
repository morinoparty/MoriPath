import { createFileRoute } from "@tanstack/react-router";
import { ErrorComponent } from "./-components/error-component";
import { NotFoundPage } from "./-components/not-found-page";

export const Route = createFileRoute("/_signed_in/$")({
    component: NotFoundPage,
    errorComponent: ErrorComponent,
});
