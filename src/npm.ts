import type {AnyFileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {git} from './git.js';
import {prettier} from './prettier.js';
import {vscode} from './vscode.js';

/** https://www.npmjs.com */
export const npm = (): readonly AnyFileStatement[] => [
  mergeContent(git.ignoreFile, [`node_modules`]),
  mergeContent(prettier.ignoreFile, [`package-lock.json`]),

  mergeContent(vscode.extensionsFile, {
    recommendations: [`eg2.vscode-npm-script`],
  }),

  mergeContent(vscode.settingsFile, {
    'files.exclude': {'node_modules': true, 'package-lock.json': true},
  }),
];
