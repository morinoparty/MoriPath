import { css } from "@/styled-system/css";
import Image from "next/image";

export const Logo = () => {
    return (
        <div
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
                    aspectRatio: 1,
                })}
                src="/moripa.svg"
                alt="MoriPath"
                width={200}
                height={200}
            />
        </div>
    );
};
