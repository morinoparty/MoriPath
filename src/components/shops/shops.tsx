import { css } from "@/styled-system/css";
import { ArrowLeftRight, Search, Wrench } from "lucide-react";
import { MenuButton } from "~/components/menu-button";
import { Text } from "~/components/ui/text";
import type { MenuData } from "~/lib/types";

export const Shops = () => {
  const data: MenuData[] = [
    {
      icon: <Wrench />,
      label: "お店の設定",
      link: "/shops/management",
    },
    {
      icon: <Search />,
      label: "お店を探す",
      link: "/shops/search", // 修正: 正しいリンクに変更
      isActive: false,
    },
    {
      icon: <ArrowLeftRight />, // 新しいメニューアイコン
      label: "お店の履歴", // 新しいメニューラベル
      link: "/shops/history", // 新しいリンク
      isActive: false, // 新しいメニューのアクティブ状態
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
        おみせ
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
        <div
          className={css({
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            alignSelf: "stretch",
          })}
        >
          <MenuButton data={data[0]} />
        </div>
        <div
          className={css({
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            alignSelf: "stretch",
          })}
        >
          <MenuButton data={data[1]} />
        </div>
      </div>
    </div>
  );
};
