/*eslint-env node*/

module.exports = {
    root: true,
    parser: "vue-eslint-parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
    },
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier", "plugin:vue/vue3-recommended"],
    rules: {
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
    },
};
