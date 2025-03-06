"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const runtime = "edge";

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/");
    }, [router]);

    return <></>;
}
