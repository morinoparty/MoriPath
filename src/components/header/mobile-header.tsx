import { css } from "@/styled-system/css";
import { Logo } from "~/components/logo/logo";
import { Status } from "./status";

export const MobileHeader = async () => {
  return (
    <div
      className={css({
        display: "flex",
        margin: "0 auto",
        pt: "calc(env(safe-area-inset-top) + 24px)",
        pb: "24px",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      })}
    >
      <Logo />
      <Status />
    </div>
  );
};
