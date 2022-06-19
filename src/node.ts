import type {FileStatement} from 'onecfg';
import {defineTextFile, mergeContent} from 'onecfg';
import {vscode} from './vscode.js';

export interface NodeOptions {
  readonly nodeVersion: '16' | '18';
}

const versionFile = defineTextFile(`.node-version`, []);

/** https://nodejs.org */
export const node = ({nodeVersion}: NodeOptions): readonly FileStatement[] => [
  versionFile,
  mergeContent(versionFile, [nodeVersion], {priority: -1}),
  vscode.exclude(versionFile.path),
];

node.versionFile = versionFile;
