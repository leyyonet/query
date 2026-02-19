import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nodePlugin from "eslint-plugin-n";
import prettier from "eslint-config-prettier";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        plugins: {
            n: nodePlugin,
        },
        rules: {
            "n/no-missing-import": 'off', // NodeNext ile çakışabiliyor
            "@typescript-eslint/no-unused-vars": 'off',
            "@typescript-eslint/no-namespace": 'off',
            "@typescript-eslint/prefer-namespace-keyword": 'off',
            "@typescript-eslint/no-misused-new": 'off',
            "@typescript-eslint/ban-types": 'off',
            "@typescript-eslint/no-explicit-any": 'off',
            "@typescript-eslint/no-unsafe-function-type": 'off',
            "@typescript-eslint/no-empty-object-type": 'off',
        },
    }
];
