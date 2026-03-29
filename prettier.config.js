// prettier.config.js
module.exports = {
  plugins: ["prettier-plugin-tailwindcss"],

  // Line length
  printWidth: 100,

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Semicolons
  semi: false,

  // Quotes
  singleQuote: false,
  quoteProps: "as-needed",

  // Trailing commas
  trailingComma: "es5",

  // Spacing
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",

  // Line endings
  endOfLine: "lf",

  // HTML/JSX formatting
  htmlWhitespaceSensitivity: "css",

  // Embedded languages
  embeddedLanguageFormatting: "auto",

  // Prose wrapping
  proseWrap: "preserve",
}
