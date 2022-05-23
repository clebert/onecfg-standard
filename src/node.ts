import type {FileStatement} from 'onecfg';
import {defineTextFile, mergeContent} from 'onecfg';
import {vscode} from './vscode.js';

export interface NodeOptions {
  readonly nodeVersion: string;
}

const versionFile = defineTextFile(`.node-version`, []);

/** https://nodejs.org */
export const node = ({nodeVersion}: NodeOptions): readonly FileStatement[] => [
  versionFile,

  mergeContent(versionFile, [nodeVersion], {priority: -1}),

  mergeContent(vscode.settingsFile, {
    'files.exclude': {[versionFile.path]: true},
  }),
];

node.versionFile = versionFile;
