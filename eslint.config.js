import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'dist-api', 'dist-worker', 'node_modules', '.worktrees', '.superpowers', 'graft', 'graphify-out', 'playwright-report', 'test-results', 'backups', '.backups', 'private-documents', '.platform-test', 'artifacts', 'AGAP_Accepted_Design_Archive_*'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['infra/scripts/*.mjs'], languageOptions: { globals: globals.node } },
  { files: ['design-library/specimens/**/*.js', 'design-library/prototypes/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['**/*.{ts,tsx}'], languageOptions: { globals: { ...globals.browser, ...globals.node } }, plugins: { 'react-hooks': hooks }, rules: { ...hooks.configs.recommended.rules } },
  {
    files: ['packages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/src/domain', '**/src/domain/*', '**/src/app/*', '**/src/features/*', '**/src/demo/*', '**/src/shared/*', '**/apps/**'],
          message: 'Shared packages must not import from frontend src/ or apps/. Import from packages/domain, packages/contracts, or packages/finance.',
        }],
      }],
    },
  },
  {
    files: ['apps/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/src/domain', '**/src/domain/*', '**/src/app/*', '**/src/features/*', '**/src/demo/*', '**/src/shared/*'],
          message: 'Server apps must not import from frontend src/. Import from packages/domain, packages/finance, or packages/contracts.',
        }],
      }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['**/apps/**'],
            message: 'Frontend code must not import from apps/. Import shared contracts from packages/contracts or packages/api-client.',
          },
          {
            group: ['**/features/access/useCommand*', '**/features/access/usePage*', '**/features/access/useUnsavedChanges*'],
            message: 'Shared workspace hooks live in src/shared/hooks/.',
          },
        ],
      }],
    },
  },
);
