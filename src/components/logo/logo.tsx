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
            <Image src="/moripa.svg" alt="MoriPath" width={48} height={48} />
        </div>
    );
};
