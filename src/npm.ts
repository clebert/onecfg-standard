import type {FileStatement} from 'onecfg';
import {defineTextFile} from 'onecfg';
import {git} from './git.js';
import {headerComment} from './header-comment.js';
import {prettier} from './prettier.js';
import {typescript} from './typescript.js';
import {vscode} from './vscode.js';

const configFile = defineTextFile(`.npmrc`, [`# ${headerComment}`]);

/** https://www.npmjs.com */
export const npm = (): readonly FileStatement[] => [
  configFile,
  git.ignore(`node_modules`),
  prettier.ignore(`package-lock.json`),
  typescript.exclude(`node_modules`),
  vscode.addExtensions(`eg2.vscode-npm-script`),
  vscode.exclude(`node_modules`, configFile.path, `package-lock.json`),
];

npm.configFile = configFile;
