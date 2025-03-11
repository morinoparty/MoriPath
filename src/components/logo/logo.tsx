import { css } from "@/styled-system/css";
import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
    return (
        <Link
            href={"/"}
            className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "16px",
            })}
        >
            <Image
                className={css({
                    height: "var(--sizes-header-height)",
                    width: "var(--sizes-header-height)",
                    fill: "red",
                    aspectRatio: 1,
                })}
                src="/moripa.svg"
                alt="MoriPath"
                width={200}
                height={200}
            />
        </Link>
    );
};
