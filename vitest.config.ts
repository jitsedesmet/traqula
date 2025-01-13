/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: [
        'packages/*/lib/**/*.ts'
      ],
    },
    include: [
      'test/**/*.test.ts',
    ],
    typecheck: {
      enabled: true,
      include: [
        'packages/*/test/**/*.types.ts',
      ]
    },
  },
})