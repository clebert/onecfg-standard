import type {FileStatement} from 'onecfg';
import {eslint} from './eslint.js';
import {git} from './git.js';
import {prettier} from './prettier.js';
import {typescript} from './typescript.js';
import {vscode} from './vscode.js';

export const ignore = (
  ...patterns: readonly string[]
): readonly FileStatement[] => [
  eslint.ignore(...patterns),
  git.ignore(...patterns),
  prettier.ignore(...patterns),
  typescript.exclude(...patterns),
  vscode.exclude(...patterns),
];
