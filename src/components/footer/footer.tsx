import { css } from "@/styled-system/css";
import { MobileFooter } from "./mobile-footer";

export const Footer = () => {
    return (
        <>
            {/*for smartphone*/}
            <div
                className={css({
                    width: "100%",
                    // md: {
                    //     display: "none",
                    // },
                })}
            >

            </div>
        </>
    );
};
