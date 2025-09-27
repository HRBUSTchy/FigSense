import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // JavaScript配置
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { prettier },
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  // TypeScript配置
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [...tseslint.configs.recommended],
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  // 应用Prettier配置
  eslintConfigPrettier
);
