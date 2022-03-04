import type {AnyFileStatement} from 'onecfg';
import {defineTextFile, mergeContent} from 'onecfg';
import {git} from './git.js';
import {vscode} from './vscode.js';

const configFile = defineTextFile(`.editorconfig`, []);

/** https://editorconfig.org */
export const editorconfig = (): readonly AnyFileStatement[] => [
  configFile,

  mergeContent(
    configFile,
    [
      `root = true`,
      `[*]`,
      `charset = utf-8`,
      `end_of_line = lf`,
      `indent_size = 2`,
      `indent_style = space`,
      `insert_final_newline = true`,
      `trim_trailing_whitespace = true`,
    ],
    {priority: -1},
  ),

  mergeContent(git.ignoreFile, [configFile.path]),

  mergeContent(vscode.extensionsFile, {
    recommendations: [`editorconfig.editorconfig`],
  }),

  mergeContent(vscode.settingsFile, {
    'editor.formatOnSave': true,
    'files.exclude': {[configFile.path]: true},
  }),
];

editorconfig.configFile = configFile;
