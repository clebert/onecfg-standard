import type {AnyFileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {eslint} from './eslint.js';
import {git} from './git.js';
import {prettier} from './prettier.js';
import {vscode} from './vscode.js';

export const ignore = (
  ...patterns: readonly string[]
): readonly AnyFileStatement[] => [
  mergeContent(eslint.ignoreFile, patterns),
  mergeContent(git.ignoreFile, patterns),
  mergeContent(prettier.ignoreFile, patterns),

  mergeContent(vscode.settingsFile, {
    'files.exclude': Object.fromEntries(
      patterns.map((pattern) => [pattern, true]),
    ),
  }),
];
