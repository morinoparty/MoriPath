import { css } from "@/styled-system/css";

type props = {
    balance: number;
};

export const TotalBalance = ({ balance }: props) => {
    return (
        <>
            <div
                className={css({
                    paddingTop: "64px",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", // 垂直方向の中央揃え
                    gap: "8px",
                })}
            >
                <div
                    className={css({
                        fontSize: "12px",
                        fontStyle: "normal",
                        fontWeight: 400,
                        lineHeight: "normal",
                        textAlign: "center", // 水平方向の中央揃え
                    })}
                >
                    現在の残高
                </div>
                <div
                    className={css({
                        display: "flex",
                        justifyContent: "center", // 水平方向の中央揃え
                        alignItems: "flex-end",
                        gap: "8px",
                        alignSelf: "stretch",
                    })}
                >
                    <div
                        className={css({
                            fontSize: "var(--typography-size-4xl, 36px)",
                            fontStyle: "normal",
                            fontWeight: "var(--typography-weight-bold, 700)",
                            lineHeight: "44px /* 122.222% */",
                            letterSpacing: "-0.72px",
                        })}
                    >
                        {balance.toLocaleString()}
                    </div>
                    <div
                        className={css({
                            fontSize: "var(--typography-size-md, 16px)",
                            fontStyle: "normal",
                            fontWeight: "var(--typography-weight-regular, 400)",
                            lineHeight: "24px /* 150% */",
                        })}
                    >
                        円
                    </div>
                </div>
            </div>
        </>
    );
};
