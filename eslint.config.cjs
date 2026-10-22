const {
    defineConfig,
} = require("eslint/config");

const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        ecmaVersion: "latest",
        parserOptions: {},
    },

    extends: compat.extends(
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/eslint-config-prettier/skip-formatting",
    ),
}]);
