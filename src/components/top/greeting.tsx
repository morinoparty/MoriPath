"use client";
import { css } from "@/styled-system/css";
export const Greeting = () => {
    // クライアントの時間を取得するために、Dateオブジェクトを使用します。
    const hour = new Date().getHours(); // 現在の時間を取得

    return (
        <h1
            className={css({
                fontSize: "3xl",
                fontWeight: "bold",
                padding: "16px 0",
            })}
        >
            {(() => {
                // 時間に応じた挨拶を返します。
                if (6 <= hour && hour < 10) return "おはよう 🌅"; // 6-10
                if (10 <= hour && hour < 18) return "こんにちは ☀️"; // 10-18
                return "こんばんは 🌙"; // それ以外は「こんばんは」
            })()}
        </h1>
    );
};
