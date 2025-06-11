module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-console": "off",
    "no-restricted-syntax": "off",
    "max-classes-per-file": "off",
    "no-await-in-loop": "off",
    "no-underscore-dangle": ["error", { allowAfterThis: true }],
    "no-param-reassign": ["warn"],
    "max-len": ["error", { code: 120 }],
    camelcase: "off",
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
  },
};
