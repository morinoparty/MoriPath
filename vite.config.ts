import { defineConfig } from "vite-plus";

// 整形・lint の対象外 (依存・生成物・外部由来のコード)
const ignorePatterns = [
    "**/node_modules/**",
    "**/public/**",
    "**/styled-system/**",
    "**/src/components/ui/**",
    "**/cloudflare-env.d.ts",
    "**/theme/**",
    "**/.vscode/**",
    "**/dist/**",
    "**/routeTree.gen.ts",
    "**/storybook-static/**",
    "**/.cloudflare/**",
];

export default defineConfig({
    fmt: {
        tabWidth: 4,
        printWidth: 80,
        // package.json のキー順は手で管理する
        sortPackageJson: false,
        // 既存の並び (プロトコル付き → パッケージ → エイリアス → 絶対パス → 遠い相対パス順) を保つ
        sortImports: {
            newlinesBetween: false,
            // コメントを境に並べ替えを区切る。順序に意味のある副作用 import (CSS など) の直前にはコメントを置く
            partitionByComment: true,
            customGroups: [
                { groupName: "protocol", elementNamePattern: ["*:*"] },
                { groupName: "absolute", elementNamePattern: ["/**"] },
                {
                    groupName: "parent-4",
                    elementNamePattern: ["../../../../**"],
                },
                { groupName: "parent-3", elementNamePattern: ["../../../**"] },
                { groupName: "parent-2", elementNamePattern: ["../../**"] },
            ],
            groups: [
                ["builtin", "protocol"],
                "external",
                ["internal", "subpath"],
                "absolute",
                "parent-4",
                "parent-3",
                "parent-2",
                "parent",
                ["sibling", "index"],
                "style",
                "unknown",
            ],
        },
        // 対象は JS / TS / JSON / CSS に絞る
        ignorePatterns: [
            ...ignorePatterns,
            "**/*.md",
            "**/*.yml",
            "**/*.yaml",
            "**/*.html",
            "**/*.toml",
        ],
    },
    lint: {
        plugins: [
            "eslint",
            "typescript",
            "unicorn",
            "oxc",
            "react",
            "jsx-a11y",
        ],
        // correctness を基本に、移行前の Biome の recommended に相当するルールを他カテゴリからも有効化する
        categories: { correctness: "error" },
        // 不要になった抑制コメントを知らせる
        options: { reportUnusedDisableDirectives: "warn" },
        ignorePatterns,
        rules: {
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-case-declarations": "error",
            "no-constructor-return": "error",
            "no-fallthrough": "error",
            "no-label-var": "error",
            "no-self-compare": "error",
            "no-use-before-define": [
                "error",
                { functions: false, classes: false, variables: false },
            ],
            "typescript/no-empty-interface": [
                "error",
                { allowSingleExtends: true },
            ],
            "react/button-has-type": "error",
            "react/jsx-no-comment-textnodes": "error",
            "react/jsx-no-target-blank": "error",
            "react/no-array-index-key": "error",
            "react/no-danger": "error",
            "react/rules-of-hooks": "error",
            "no-script-url": "error",
            "jsx-a11y/anchor-ambiguous-text": "error",
            "oxc/misrefactored-assign-op": "error",
            "array-callback-return": "error",
            "no-redeclare": "error",
            "unicorn/new-for-builtins": "error",
            // Oxfmt は import 文の順だけを並べるため、{ } 内の名前は lint で並べる (vp check --fix で直る)
            "sort-imports": [
                "error",
                { ignoreDeclarationSort: true, ignoreCase: true },
            ],
            // CI を落とさず警告に留めるもの
            "default-case-last": "warn",
            "no-array-constructor": "warn",
            "no-empty": "warn",
            "no-extra-label": "warn",
            "no-labels": "warn",
            "no-lone-blocks": "warn",
            "no-proto": "warn",
            "no-prototype-builtins": "warn",
            "no-sequences": "warn",
            "no-template-curly-in-string": "warn",
            "no-unneeded-ternary": "warn",
            "no-unused-vars": "warn",
            "no-useless-constructor": "warn",
            "prefer-arrow-callback": "warn",
            "prefer-const": "warn",
            "prefer-exponentiation-operator": "warn",
            "prefer-numeric-literals": "warn",
            "prefer-regex-literals": "warn",
            "prefer-rest-params": "warn",
            "typescript/adjacent-overload-signatures": "warn",
            "typescript/ban-ts-comment": "warn",
            "typescript/ban-types": "warn",
            "typescript/consistent-type-imports": "warn",
            "typescript/no-explicit-any": "warn",
            "typescript/no-invalid-void-type": "warn",
            "typescript/no-non-null-assertion": "warn",
            "typescript/no-unnecessary-type-constraint": "warn",
            "typescript/prefer-function-type": "warn",
            "typescript/prefer-literal-enum-member": "warn",
            "oxc/no-accumulating-spread": "warn",
            "oxc/no-const-enum": "warn",
            "react/jsx-no-useless-fragment": "warn",
            "unicorn/no-document-cookie": "warn",
            "unicorn/no-instanceof-array": "warn",
            "unicorn/no-static-only-class": "warn",
            "unicorn/no-useless-switch-case": "warn",
            "unicorn/prefer-array-flat-map": "warn",
            "unicorn/prefer-date-now": "warn",
            "unicorn/prefer-node-protocol": "warn",
            // プロジェクト独自のコーディング規約
            "no-console": ["error", { allow: ["warn", "error", "info"] }],
            "no-param-reassign": "error",
            "default-param-last": "error",
            "typescript/prefer-enum-initializers": "error",
            "react/self-closing-comp": "error",
            "one-var": ["error", "never"],
            "unicorn/prefer-number-properties": [
                "error",
                { checkInfinity: true },
            ],
            "typescript/no-inferrable-types": "error",
            "no-else-return": ["error", { allowElseIf: false }],
            // Biome の noUnusedTemplateLiteral は Oxlint に相当ルールがないため移行していない
        },
        overrides: [
            {
                // Storybook のデコレーターは Story の描画中に呼ばれるため hooks を使える
                files: ["storybook/.storybook/preview.tsx"],
                rules: { "react/rules-of-hooks": "off" },
            },
        ],
    },
    run: {
        tasks: {
            // 入力が変わっていなければ Storybook を再ビルドせず、前回の storybook-static を復元する
            "build-storybook": {
                command: "vpx storybook build",
                cwd: "storybook",
                cache: {
                    // 自動追跡は pnpm の状態ファイルやキャッシュの有無まで拾い CI で毎回ミスするため、入力を明示する
                    input: [
                        "storybook/**",
                        "!storybook/node_modules/**",
                        "!storybook/storybook-static/**",
                        // stories が読み込む app のコンポーネント・静的ファイル・Panda 生成物
                        "app/src/**",
                        "app/public/**",
                        "app/styled-system/**",
                        "app/panda.config.ts",
                        "app/package.json",
                        "app/tsconfig*.json",
                        // ビルド中に探索されるツール設定
                        "app/.babelrc*",
                        "app/.browserslistrc",
                        ".browserslistrc",
                        // 依存のバージョン
                        "package.json",
                        "pnpm-lock.yaml",
                        "pnpm-workspace.yaml",
                    ],
                    output: ["storybook/storybook-static/**"],
                    env: ["STORYBOOK_*", "VITE_*", "NODE_ENV"],
                },
            },
        },
    },
});
