import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '.husky/install.mjs',
      'cli-incremental-info',
      'coverage',
      'dist/*',
      'src/generated/client',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    // eslint@9 の真似
    linterOptions: { reportUnusedDisableDirectives: 'warn' },

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
        projectService: true,
      },
    },
  },
  {
    // TODO
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: { arguments: false },
        },
      ],
    },
  },
  eslintConfigPrettier,
)
