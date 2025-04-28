import { css } from "@/styled-system/css";
import { Button } from "~/components/ui/button";
import { signIn } from "~/lib/auth";

export const LoginButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("MineAuth", { redirectTo: "/" });
      }}
    >
      <Button className={loginBoxStyle} type="submit">
        <span>Moripa APIにログイン</span>
      </Button>
    </form>
  );
};

const loginBoxStyle = css({
  display: "flex",
  fontSize: "1rem",
  width: "100%",
  bg: "var(--colors-primary)",
  _hover: {
    bgColor: "var(--colors-primary90)",
  },
  fontWeight: "normal",
  height: "var(--sizes-header-height)",
  padding: "var(--spacings-radii-0, 0px) var(--spacings-radii-4, 16px)",
  justifyContent: "center",
  alignItems: "center",
  gap: "var(--spacings-radii-2, 8px)",
  flexShrink: 0,
});
