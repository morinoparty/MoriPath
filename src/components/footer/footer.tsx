import { css } from "@/styled-system/css";
import { MobileFooter } from "./mobile-footer";

export const Footer = () => {
    return (
        <div>
            {/*for smartphone*/}
            <div
                className={css({
                    md: {
                        display: "none",
                    },
                })}
            >
                <MobileFooter />
            </div>
        </div>
    );
};
