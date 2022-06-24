module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended' // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  ignorePatterns: ['test/**/*.ts', 'src/types/**/*.ts'],
  rules: {
    quotes: 'off',
    semi: 'error', //debe tener ; al final
    '@typescript-eslint/no-inferrable-types': 2,
    '@typescript-eslint/typedef': [
      'warn',
      {
        arrowParameter: true,
        variableDeclaration: true
      }
    ],
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
    'space-infix-ops': 2, //que se dejen espacio entre los operadores
    'no-console': 'warn', //no usar console y emita alerta
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/explicit-function-return-type': 2,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-module-boundary-types': [
      'warn',
      {
        allowArgumentsExplicitlyTypedAsAny: true
      }
    ],
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/consistent-type-assertions': 1,
    '@typescript-eslint/no-unused-vars': 2,
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ]
  }
};
