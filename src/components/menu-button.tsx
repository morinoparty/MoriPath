import { css } from "@/styled-system/css";
import { ChevronRight, Construction } from "lucide-react";
import Link from "next/link";
import { Icon } from "~/components/ui/icon";
import { Text } from "~/components/ui/text";
import type { MenuData } from "~/lib/types";

type props = {
  data: MenuData;
};

// MenuButtonコンポーネントを定義します。dataのisActiveをtrueで初期化します。
export const MenuButton = ({ data }: props) => {
  // isActiveが未定義の場合はtrueに設定します。
  const isActive = data.isActive !== undefined ? data.isActive : true;

  // 共通のスタイルを変数に格納
  const buttonStyle = css({
    display: "flex",
    padding: "8px 16px",
    width: "100%",
    minHeight: "48px",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "xl",
    border: "1px solid var(--colors-border-default)",
    background: "#FFF",
  });
  data = {
    isActive: isActive,
    ...data,
  };
  // 条件分岐で適切なコンポーネントを返します
  return isActive ? (
    <Link href={data.link} className={buttonStyle}>
      <InnerMenuButton data={data} />
    </Link>
  ) : (
    <div className={buttonStyle}>
      <InnerMenuButton data={data} />
    </div>
  );
};

const InnerMenuButton = ({ data }: props) => {
  return (
    <>
      <div className={css({ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 })}>
        <Icon className={iconStyle}>{data.icon}</Icon>
        <div className={css({ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" })}>
          <Text className={textStyle}>{data.label}</Text>
        </div>
      </div>
      <Icon className={css({ width: "16px", height: "16px", flexShrink: 0, color: "var(--colors-fg-subtle)" })}>
        {data.isActive ? <ChevronRight /> : <Construction />}
      </Icon>
    </>
  );
};

const iconStyle = css({
  width: "20px",
  height: "20px",
  flexShrink: 0,
  aspectRatio: "1/1",
});

const textStyle = css({
  textAlign: "right",
  fontSize: "sm",
  fontStyle: "normal",
  lineHeight: "18px /* 150% */",
});
