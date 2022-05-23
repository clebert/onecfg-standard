import type {FileStatement} from 'onecfg';
import {defineJsonFile, mergeContent} from 'onecfg';
import {git} from './git.js';
import {vscode} from './vscode.js';

const configFile = defineJsonFile(`.swcrc`, {});

/** https://swc.rs */
export const swc = (): readonly FileStatement[] => [
  configFile,

  mergeContent(configFile, {}, {priority: -1}),
  mergeContent(git.ignoreFile, [configFile.path]),

  mergeContent(vscode.settingsFile, {
    'files.exclude': {[configFile.path]: true, '.swc': true},
  }),
];

swc.configFile = configFile;
