import type {FileChange, FileStatement} from 'onecfg';
import {defineJsonFile, defineTextFile, mergeContent} from 'onecfg';
import {git} from './git.js';
import {headerComment} from './header-comment.js';
import {npm} from './npm.js';
import {prettier} from './prettier.js';
import {vscode} from './vscode.js';

const configFile = defineJsonFile(`.eslintrc.json`, {});
const ignoreFile = defineTextFile(`.eslintignore`, [`# ${headerComment}`]);

/** https://eslint.org */
export const eslint = (): readonly FileStatement[] => [
  configFile,
  ignoreFile,

  mergeContent(
    configFile,
    {
      root: true,
      parserOptions: {ecmaVersion: `latest`, sourceType: `module`},
      plugins: [`eslint-plugin-import`, `markdown`],
      rules: {
        'complexity': `error`,
        'curly': `error`,
        'eqeqeq': [`error`, `always`, {null: `ignore`}],
        'import/no-commonjs': `error`,
        'import/extensions': [`error`, `always`, {ignorePackages: true}],
        'import/no-duplicates': [`error`, {considerQueryString: true}],
        'import/no-extraneous-dependencies': `error`,
        'import/order': [
          `error`,
          {
            'alphabetize': {order: `asc`},
            'newlines-between': `never`,
            'warnOnUnassignedImports': true,
          },
        ],
        'no-restricted-globals': [
          `error`,
          {
            name: `__dirname`,
            message: `Use \`dirname(fileURLToPath(import.meta.url))\` instead.`,
          },
          {
            name: `__filename`,
            message: `Use \`fileURLToPath(import.meta.url)\` instead.`,
          },
        ],
        'no-shadow': `error`,
        'object-shorthand': `error`,
        'prefer-const': `error`,
        'quotes': [`error`, `backtick`],
        'sort-imports': [
          `error`,
          {ignoreDeclarationSort: true, ignoreMemberSort: false},
        ],
      },
      overrides: [
        {
          files: [`**/*.cjs`],
          parserOptions: {sourceType: `script`},
          rules: {
            'import/no-commonjs': `off`,
            'import/extensions': `off`,
            'no-restricted-globals': `off`,
          },
        },
        {files: [`**/*.mjs`], parserOptions: {sourceType: `module`}},
        {files: [`**/*.md`], processor: `markdown/markdown`},
        {files: [`**/*.md/*.js`], rules: {quotes: [`error`, `single`]}},
      ],
    },
    {priority: -1},
  ),

  git.ignore(configFile.path, ignoreFile.path),
  mergeContent(npm.packageFile, {scripts: {lint: `eslint .`}}),
  prettier.ignore(configFile.path),
  vscode.addExtensions(`dbaeumer.vscode-eslint`),
  vscode.exclude(configFile.path, ignoreFile.path),

  mergeContent(vscode.settingsFile, {
    'editor.codeActionsOnSave': {'source.fixAll.eslint': true},
  }),
];

eslint.ignore = (
  ...patterns: readonly (string | undefined | false)[]
): FileChange<readonly string[]> =>
  mergeContent(
    ignoreFile,
    patterns.filter(
      (pattern): pattern is string => typeof pattern === `string`,
    ),
    {dedupeArrays: true},
  );

eslint.configFile = configFile;
eslint.ignoreFile = ignoreFile;
