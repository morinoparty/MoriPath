import { jaModel, Parser } from "budoux";
import { useMemo } from "react";
import { css, cx } from "../../../styled-system/css";

// 文字列を分けるだけなので、HTML 処理 (サーバーで linkedom を読む) の無い素の Parser を使う。
// モデルの読み込みは重いので、モジュールで 1 度だけ作って使い回す
const parser = new Parser(jaModel);

const phraseTextStyle = css({
    // 文節の区切り (wbr) でだけ折り返し、単語の途中で改行しない
    wordBreak: "keep-all",
    // 1 文節が行より長いとき (長いプレイヤー名など) は、はみ出さずにどこでも折り返す
    overflowWrap: "anywhere",
});

export interface PhraseTextProps {
    children: string;
    className?: string;
}

/** 日本語の文章を BudouX で文節に分け、文節の切れ目で折り返すテキスト */
export const PhraseText = ({ children, className }: PhraseTextProps) => {
    const phrases = useMemo(() => parser.parse(children), [children]);
    return (
        <span className={cx(phraseTextStyle, className)}>
            {/* 文節の間にだけ改行できる位置 (wbr) を挟む。文字列は key 不要なので wbr にだけ付ける */}
            {phrases.flatMap((phrase, index) =>
                index === 0
                    ? [phrase]
                    : // oxlint-disable-next-line react/no-array-index-key -- 文節は並び替わらず、位置だけで区別できる
                      [<wbr key={index} />, phrase],
            )}
        </span>
    );
};
