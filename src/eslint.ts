import type {AnyFileStatement} from 'onecfg';
import {defineJsonFile, defineTextFile, mergeContent} from 'onecfg';
import {git} from './git.js';
import {headerComment} from './header-comment.js';
import {prettier} from './prettier.js';
import {vscode} from './vscode.js';

const configFile = defineJsonFile(`.eslintrc.json`, {});
const ignoreFile = defineTextFile(`.eslintignore`, [`# ${headerComment}`]);

/** https://eslint.org */
export const eslint = (): readonly AnyFileStatement[] => [
  configFile,
  ignoreFile,

  mergeContent(
    configFile,
    {
      root: true,
      plugins: [`eslint-plugin-import`, `markdown`],
      rules: {
        'complexity': `error`,
        'curly': `error`,
        'eqeqeq': [`error`, `always`, {null: `ignore`}],
        'import/no-extraneous-dependencies': `error`,
        'import/order': [
          `error`,
          {
            'alphabetize': {order: `asc`},
            'newlines-between': `never`,
            'warnOnUnassignedImports': true,
          },
        ],
        'no-duplicate-imports': `error`,
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
        {files: [`**/*.cjs`], parserOptions: {sourceType: `script`}},
        {files: [`**/*.mjs`], parserOptions: {sourceType: `module`}},
        {files: [`**/*.md`], processor: `markdown/markdown`},
        {files: [`**/*.md/*.js`], rules: {quotes: [`error`, `single`]}},
      ],
    },
    {priority: -1},
  ),

  mergeContent(git.ignoreFile, [configFile.path, ignoreFile.path]),
  mergeContent(prettier.ignoreFile, [configFile.path]),

  mergeContent(vscode.extensionsFile, {
    recommendations: [`dbaeumer.vscode-eslint`],
  }),

  mergeContent(vscode.settingsFile, {
    'editor.codeActionsOnSave': {'source.fixAll.eslint': true},
    'files.exclude': {[configFile.path]: true, [ignoreFile.path]: true},
  }),
];

eslint.configFile = configFile;
eslint.ignoreFile = ignoreFile;
