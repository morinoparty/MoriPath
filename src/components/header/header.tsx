import { css } from "@/styled-system/css";
import { MobileHeader } from "./mobile-header";

export const Header = () => {
  return (
    <div>
      {/*for smartphone*/}
      <div
        className={css({
          // md: {
          //     display: "none",
          // },
        })}
      >
        <MobileHeader />
      </div>

      {/*for desktop*/}
      <div
        className={css({
          display: "none",
          // md: {
          //     display: "block",
          // },
        })}
      >
        WIP
      </div>
    </div>
  );
};
