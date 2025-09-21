import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginReact from 'eslint-plugin-react'
import pluginUnusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parser: tseslint.parser, // 支持 TypeScript
    },
    plugins: {
      'unused-imports': pluginUnusedImports,
    },
    rules: {
      // 关闭原生和 unused-imports 的 vars 规则
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off', // 👈 关掉它

      // ✅ 启用 @typescript-eslint 的完整规则
      '@typescript-eslint/no-unused-vars': [
        'error', // 或 'warn'
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // 保留 unused-imports 删除无用 import 的功能
      'unused-imports/no-unused-imports': 'error',

      // 关闭 react/react-in-jsx-scope 规则，Next.js 不需要
      'no-undef': 'off',
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react: pluginReact,
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // Next.js 不需要
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]

export default eslintConfig
