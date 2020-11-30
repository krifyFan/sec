module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["plugin:vue/essential", "@vue/typescript"],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "off" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "vue/no-parsing-error": [2, {
            "x-invalid-end-tag": false
        }]
    },
    parserOptions: {
        parser: "@typescript-eslint/parser"
    }
};