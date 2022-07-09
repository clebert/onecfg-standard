import type {FileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {npm} from './npm.js';

export const wallaby = (): readonly FileStatement[] => [
  mergeContent(npm.packageFile, {
    wallaby: {env: {params: {runner: `--experimental-vm-modules`}}},
  }),
];
