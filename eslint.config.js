export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        window: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "max-len": [2, { code: 100, tabWidth: 2, ignoreUrls: true }],
    },
  },
  {
    files: ["**/*.js"],
  },
];
