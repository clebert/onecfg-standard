import type {AnyFileStatement} from 'onecfg';
import {defineTextFile, mergeContent} from 'onecfg';
import {vscode} from './vscode.js';

const ignoreFile = defineTextFile(`.gitignore`, []);

/** https://git-scm.com */
export const git = (): readonly AnyFileStatement[] => [
  ignoreFile,

  mergeContent(vscode.settingsFile, {
    'files.exclude': {[ignoreFile.path]: true, '**/.git': true},
  }),
];

git.ignoreFile = ignoreFile;
