import type {FileStatement} from 'onecfg';
import {defineJsonFile, mergeContent} from 'onecfg';
import {git} from './git.js';
import {typescript} from './typescript.js';
import {vscode} from './vscode.js';

export interface SwcOptions {
  readonly target: `es20${number}`;
  readonly noSourceMaps?: boolean;
  readonly removeComments?: boolean;
}

const configFile = defineJsonFile(`.swcrc`, {});

/** https://swc.rs */
export const swc = ({
  target,
  noSourceMaps,
  removeComments,
}: SwcOptions): readonly FileStatement[] => [
  configFile,

  mergeContent(
    configFile,
    {
      jsc: {target},
      module: {type: `es6`},
      sourceMaps: !noSourceMaps,
      minify: removeComments
        ? {compress: false, format: {comments: false}}
        : undefined,
    },
    {priority: -1},
  ),

  git.ignore(`.swc`, configFile.path),
  typescript.exclude(`.swc`),
  vscode.exclude(`.swc`, configFile.path),
];

swc.configFile = configFile;
