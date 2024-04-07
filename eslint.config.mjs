// @ts-check

import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['cli-incremental-info', 'coverage', 'dist/*'],
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        allowAutomaticSingleRunInference: true,
        cacheLifetime: {
          glob: 'Infinity',
        },
        project: ['tsconfig.json', 'tsconfig.*.json'],
      },
    },
  },
  {
    // TODO
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
    },
  },
)
