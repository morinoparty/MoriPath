import { css } from "@/styled-system/css";
import { ArrowLeftRight, PiggyBank, Send } from "lucide-react";
import { MenuButton } from "~/components/menu-button";
import { Text } from "~/components/ui/text";
import type { MenuData } from "~/lib/types";

export const Money = () => {
  const data: MenuData[] = [
    {
      icon: <Send />,
      label: "お金を送る",
      link: "/money/send",
    },
    {
      icon: <PiggyBank />,
      label: "お金を貯める",
      link: "/money/history",
      isActive: false,
    },
    {
      icon: <ArrowLeftRight />,
      label: "お金の記録",
      link: "/money/history",
      isActive: false,
    },
  ];
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        paddingTop: 8,
        gap: "8px",
      })}
    >
      <Text
        className={css({
          display: "flex",
          width: "100px",
          height: "48px",
          flexDirection: "column",
          justifyContent: "center",
          fontSize: "var(--typography-size-2xl, 24px)",
          fontStyle: "normal",
          fontWeight: "var(--typography-weight-bold, 700)",
          lineHeight: "32px /* 133.333% */",
        })}
      >
        おかね
      </Text>
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          alignSelf: "stretch",
        })}
      >
        <MenuButton data={data[0]} />
        <div
          className={css({
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            alignSelf: "stretch",
          })}
        >
          <MenuButton data={data[1]} />
          <MenuButton data={data[2]} />
        </div>
      </div>
    </div>
  );
};
