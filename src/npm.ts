import type {FileStatement} from 'onecfg';
import {defineTextFile, mergeContent} from 'onecfg';
import {git} from './git.js';
import {headerComment} from './header-comment.js';
import {prettier} from './prettier.js';
import {vscode} from './vscode.js';

const configFile = defineTextFile(`.npmrc`, [`# ${headerComment}`]);

/** https://www.npmjs.com */
export const npm = (): readonly FileStatement[] => [
  configFile,

  mergeContent(git.ignoreFile, [`node_modules`]),
  mergeContent(prettier.ignoreFile, [`package-lock.json`]),

  mergeContent(vscode.extensionsFile, {
    recommendations: [`eg2.vscode-npm-script`],
  }),

  mergeContent(vscode.settingsFile, {
    'files.exclude': {
      [configFile.path]: true,
      'node_modules': true,
      'package-lock.json': true,
    },
  }),
];

npm.configFile = configFile;
