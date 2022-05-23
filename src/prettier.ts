import type {FileStatement} from 'onecfg';
import {defineJsonFile, defineTextFile, mergeContent} from 'onecfg';
import {eslint} from './eslint.js';
import {git} from './git.js';
import {headerComment} from './header-comment.js';
import {vscode} from './vscode.js';

const configFile = defineJsonFile(`.prettierrc.json`, {});
const ignoreFile = defineTextFile(`.prettierignore`, [`# ${headerComment}`]);

const vscodeLanguages = [
  `css`,
  `html`,
  `javascript`,
  `javascriptreact`,
  `json`,
  `typescript`,
  `typescriptreact`,
  `yaml`,
];

const vscodeExtensionName = `esbenp.prettier-vscode`;

/** https://prettier.io */
export const prettier = (): readonly FileStatement[] => [
  configFile,
  ignoreFile,

  mergeContent(
    configFile,
    {
      bracketSpacing: false,
      printWidth: 80,
      proseWrap: `always`,
      quoteProps: `consistent`,
      singleQuote: true,
      trailingComma: `all`,
    },
    {priority: -1},
  ),

  mergeContent(ignoreFile, [configFile.path], {priority: -1}),
  mergeContent(eslint.configFile, {extends: [`prettier`]}),
  mergeContent(git.ignoreFile, [configFile.path, ignoreFile.path]),
  mergeContent(vscode.extensionsFile, {recommendations: [vscodeExtensionName]}),

  mergeContent(vscode.settingsFile, {
    ...Object.fromEntries(
      vscodeLanguages.map((language) => [
        `[${language}]`,
        {'editor.defaultFormatter': vscodeExtensionName},
      ]),
    ),
    'editor.formatOnSave': true,
    'files.exclude': {[configFile.path]: true, [ignoreFile.path]: true},
  }),
];

prettier.configFile = configFile;
prettier.ignoreFile = ignoreFile;
