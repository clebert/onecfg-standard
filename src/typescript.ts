import type {AnyFileStatement} from 'onecfg';
import {defineJsonFile, mergeContent} from 'onecfg';
import {eslint} from './eslint.js';
import {git} from './git.js';
import {jest} from './jest.js';
import {prettier} from './prettier.js';
import {swc} from './swc.js';
import {vscode} from './vscode.js';

export interface TypescriptOptions {
  readonly declaration?: boolean;
  readonly outDir?: string;
  readonly sourceMap?: boolean | 'inline';
  readonly lib?: readonly string[];
}

const configFile = defineJsonFile(`tsconfig.json`, {});

/** https://www.typescriptlang.org */
export const typescript = ({
  declaration = false,
  outDir,
  sourceMap,
  lib,
}: TypescriptOptions = {}): readonly AnyFileStatement[] => [
  configFile,

  mergeContent(
    configFile,
    {
      compilerOptions: {
        // Type checking
        allowUnreachableCode: false,
        allowUnusedLabels: false,
        noFallthroughCasesInSwitch: true,
        noImplicitOverride: true,
        noImplicitReturns: true,
        noUncheckedIndexedAccess: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        strict: true,

        // Modules
        moduleResolution: `node`,
        rootDir: `src`,

        // Emit
        declaration,
        importsNotUsedAsValues: `error`,
        ...(outDir ? {outDir} : {noEmit: true}),

        ...(sourceMap === `inline`
          ? {inlineSources: true, inlineSourceMap: true}
          : sourceMap
          ? {inlineSources: true, sourceMap: true}
          : {}),

        // Interop constraints
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        isolatedModules: true,

        // Language and environment
        lib,
      },
      include: [`src/**/*.ts`, `src/**/*.tsx`],
    },
    {priority: -1},
  ),

  mergeContent(eslint.configFile, {
    plugins: [`@typescript-eslint`],
    overrides: [
      {
        files: [`src/**/*.ts`, `src/**/*.tsx`],
        parser: `@typescript-eslint/parser`,
        parserOptions: {project: configFile.path},
        rules: {
          '@typescript-eslint/await-thenable': `error`,
          '@typescript-eslint/consistent-type-imports': [
            `error`,
            {prefer: `type-imports`},
          ],
          '@typescript-eslint/explicit-module-boundary-types': [
            `error`,
            {allowDirectConstAssertionInArrowFunctions: true},
          ],
          '@typescript-eslint/no-duplicate-imports': `error`,
          '@typescript-eslint/no-floating-promises': `error`,
          '@typescript-eslint/no-shadow': [`error`, {hoist: `all`}],
          '@typescript-eslint/promise-function-async': `error`,
          '@typescript-eslint/quotes': [`error`, `backtick`],
          '@typescript-eslint/require-await': `error`,
          'no-duplicate-imports': `off`,
          'quotes': `off`,
        },
      },
    ],
  }),

  mergeContent(eslint.ignoreFile, outDir ? [outDir] : []),

  mergeContent(git.ignoreFile, [
    configFile.path,
    `tsconfig.tsbuildinfo`,
    ...(outDir ? [outDir] : []),
  ]),

  mergeContent(jest.configFile, {transform: {'^.+\\.tsx?$': [`@swc/jest`]}}),

  mergeContent(prettier.ignoreFile, [
    configFile.path,
    ...(outDir ? [outDir] : []),
  ]),

  mergeContent(swc.configFile, {
    jsc: {parser: {syntax: `typescript`}},
    sourceMaps: Boolean(sourceMap),
  }),

  mergeContent(vscode.settingsFile, {
    'files.exclude': {
      [configFile.path]: true,
      'tsconfig.tsbuildinfo': true,
      ...(outDir ? {[outDir]: true} : {}),
    },
    'typescript.tsdk': `node_modules/typescript/lib`,
  }),
];

typescript.configFile = configFile;
