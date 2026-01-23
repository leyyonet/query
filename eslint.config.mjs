import eslint from '@eslint/js';
import ts_eslint from 'typescript-eslint';

export default ts_eslint.config(
    eslint.configs.recommended,
    ts_eslint.configs.strict,
    ts_eslint.configs.stylistic,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/no-extraneous-class": "warn",
            "@typescript-eslint/unified-signatures": "warn",
            "@typescript-eslint/no-namespace": "warn",
        }
    }
);
