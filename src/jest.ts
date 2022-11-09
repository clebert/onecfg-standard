import type {FileStatement} from 'onecfg';
import {defineJsonFile, mergeContent} from 'onecfg';
import {eslint} from './eslint.js';
import {git} from './git.js';
import {npm} from './npm.js';
import {prettier} from './prettier.js';
import {typescript} from './typescript.js';
import {vscode} from './vscode.js';

export interface JestOptions {
  readonly noCoverage?: boolean;
}

const configFile = defineJsonFile(`jest.config.json`, {});

/** https://jestjs.io */
export const jest = ({
  noCoverage,
}: JestOptions = {}): readonly FileStatement[] => [
  configFile,

  mergeContent(
    configFile,
    {
      clearMocks: true,
      collectCoverage: !noCoverage,
      coverageThreshold: !noCoverage
        ? {
            global: {
              branches: 100,
              functions: 100,
              lines: 100,
              statements: 100,
            },
          }
        : undefined,
      restoreMocks: true,
      testMatch: [`**/src/**/*.test.{js,jsx}`],
    },
    {priority: -1},
  ),

  eslint.ignore(`coverage`),
  git.ignore(configFile.path, `coverage`),

  mergeContent(npm.packageFile, {
    scripts: {
      test: `NODE_OPTIONS=--experimental-vm-modules jest --silent --passWithNoTests`,
    },
  }),

  prettier.ignore(configFile.path, `coverage`),
  typescript.exclude(`coverage`),
  vscode.exclude(configFile.path, `coverage`),
];

jest.configFile = configFile;
