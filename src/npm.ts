import type {FileStatement} from 'onecfg';
import {
  defineJsonFile,
  defineTextFile,
  mergeContent,
  replaceContent,
} from 'onecfg';
import {sortPackageJson} from 'sort-package-json';
import {git} from './git.js';
import {headerComment} from './header-comment.js';
import {prettier} from './prettier.js';
import {typescript} from './typescript.js';
import {vscode} from './vscode.js';

const configFile = defineTextFile(`.npmrc`, [`# ${headerComment}`]);
const packageFile = defineJsonFile(`package.json`, {}, {tryReadFile: true});

/** https://www.npmjs.com */
export const npm = (): readonly FileStatement[] => [
  configFile,
  packageFile,
  mergeContent(packageFile, {scripts: undefined}, {priority: -1}),

  mergeContent(
    packageFile,
    {
      scripts: {
        'prepare': `node onecfg.js`,
        'ci': undefined,
        'compile:check': undefined,
        'compile:emit': undefined,
        'format:check': undefined,
        'format:write': undefined,
        'lint': undefined,
        'test': undefined,
        'release': undefined,
        'postrelease': undefined,
      },
    },
    {priority: -1},
  ),

  replaceContent(packageFile, (content) => sortPackageJson(content), {
    priority: 2,
  }),

  git.ignore(`node_modules`),
  prettier.ignore(`package-lock.json`),
  typescript.exclude(`node_modules`),
  vscode.addExtensions(`eg2.vscode-npm-script`),
  vscode.exclude(`node_modules`, configFile.path, `package-lock.json`),
];

npm.configFile = configFile;
npm.packageFile = packageFile;
