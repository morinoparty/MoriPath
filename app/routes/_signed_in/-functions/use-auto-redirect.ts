import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function useAutoRedirect(seconds: number, to: string) {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate({ to });
        }, seconds * 1000);

        return () => clearTimeout(timer);
    }, [navigate, seconds, to]);
}
