import type {FileStatement} from 'onecfg';
import {defineJsonFile, mergeContent} from 'onecfg';
import {eslint} from './eslint.js';
import {git} from './git.js';
import {prettier} from './prettier.js';
import {vscode} from './vscode.js';

const configFile = defineJsonFile(`jest.config.json`, {});

/** https://jestjs.io */
export const jest = (): readonly FileStatement[] => [
  configFile,

  mergeContent(
    configFile,
    {
      collectCoverage: true,
      coverageThreshold: {
        global: {branches: 100, functions: 100, lines: 100, statements: 100},
      },
      restoreMocks: true,
      testMatch: [`**/src/**/*.test.{js,jsx,ts,tsx}`],
    },
    {priority: -1},
  ),

  mergeContent(eslint.ignoreFile, [`coverage`]),
  mergeContent(git.ignoreFile, [configFile.path, `coverage`]),
  mergeContent(prettier.ignoreFile, [configFile.path, `coverage`]),

  mergeContent(vscode.settingsFile, {
    'files.exclude': {[configFile.path]: true, coverage: true},
  }),
];

jest.configFile = configFile;
