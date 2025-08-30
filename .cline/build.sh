#!/usr/bin/env bash
# プロンプトファイルを結合して .clinerules を生成するスクリプト

RULES_DIR=".cline/rules"
OUTPUT_FILE=".cursorrules"

END="それでは、指示に従ってタスクを遂行してください。

<指示>
{{instructions}}
"
# 出力ファイルを初期化
echo "" > $OUTPUT_FILE

# ルールファイルを結合
for file in "$RULES_DIR"/*.md; do
  if [[ -f "$file" ]]; then
    cat "$file" >> $OUTPUT_FILE
    echo -e "\n\n" >> $OUTPUT_FILE  # 各ファイルの間に改行を追加
  fi
done

echo "$END" >> $OUTPUT_FILE

echo "Generated ${OUTPUT_FILE} from $(ls -1 "$RULES_DIR"/*.md | wc -l) prompt files"