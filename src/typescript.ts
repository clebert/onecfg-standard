import type {FileChange, FileStatement} from 'onecfg';
import {defineJsonFile, mergeContent} from 'onecfg';
import {eslint} from './eslint.js';
import {git} from './git.js';
import {jest} from './jest.js';
import {npm} from './npm.js';
import {prettier} from './prettier.js';
import {swc} from './swc.js';
import {vscode} from './vscode.js';

export interface TypescriptOptions {
  readonly target: `es20${number}`;
  readonly emit?: boolean | TypescriptEmitOptions;
  readonly lib?: readonly string[];
}

export interface TypescriptEmitOptions {
  readonly noIncremental?: boolean;
  readonly noDeclaration?: boolean;
  readonly noSourceMaps?: boolean;
  readonly inlineSourceMaps?: boolean;
}

const baseCompilerOptions = {
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
  module: `node16`,
  moduleResolution: `node16`,

  // Emit
  importsNotUsedAsValues: `error`,

  // Interop constraints
  esModuleInterop: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
};

const configFile = defineJsonFile(`tsconfig.json`, {});
const emitConfigFile = defineJsonFile(`tsconfig.emit.json`, {});

function mergeEmitConfigFile({
  target,
  lib,
  noIncremental,
  noDeclaration,
  noSourceMaps,
  inlineSourceMaps,
}: TypescriptEmitOptions &
  Pick<TypescriptOptions, 'target' | 'lib'>): readonly FileStatement[] {
  return [
    emitConfigFile,

    mergeContent(
      emitConfigFile,
      {
        compilerOptions: {
          ...baseCompilerOptions,
          target,
          lib,
          incremental: !noIncremental,
          declaration: !noDeclaration,
          outDir: `lib`,
          rootDir: `src`,

          ...(noSourceMaps
            ? {}
            : inlineSourceMaps
            ? {inlineSources: true, inlineSourceMap: true}
            : {inlineSources: true, sourceMap: true}),
        },
        include: [`src/**/*`],
      },
      {priority: -1},
    ),
  ];
}

/** https://www.typescriptlang.org */
export const typescript = ({
  target,
  emit,
  lib,
}: TypescriptOptions): readonly FileStatement[] => [
  configFile,

  mergeContent(
    configFile,
    {
      compilerOptions: {
        ...baseCompilerOptions,
        target,
        lib,
        noEmit: true,
        resolveJsonModule: true,
        checkJs: true,
      },
      include: [`**/*`],
      exclude: emit ? [`lib`] : [],
    },
    {priority: -1},
  ),

  mergeContent(npm.packageFile, {scripts: {'compile:check': `tsc --pretty`}}),

  ...(emit
    ? [
        ...mergeEmitConfigFile({target, lib, ...(emit === true ? {} : emit)}),

        mergeContent(npm.packageFile, {
          scripts: {
            'compile:emit': `tsc --pretty --project tsconfig.emit.json`,
          },
        }),
      ]
    : []),

  mergeContent(eslint.configFile, {
    plugins: [`@typescript-eslint`],
    overrides: [
      {
        files: [`**/*.ts`, `**/*.tsx`],
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
          '@typescript-eslint/no-floating-promises': `error`,
          '@typescript-eslint/no-require-imports': `error`,
          '@typescript-eslint/no-shadow': [`error`, {hoist: `all`}],
          '@typescript-eslint/promise-function-async': `error`,
          '@typescript-eslint/quotes': [`error`, `backtick`],
          '@typescript-eslint/require-await': `error`,
          'no-shadow': `off`,
          'quotes': `off`,
        },
      },
    ],
  }),

  eslint.ignore(emit ? `lib` : undefined),

  git.ignore(
    configFile.path,
    ...(emit
      ? [
          emitConfigFile.path,
          emitConfigFile.path.replace(`json`, `tsbuildinfo`),
          `lib`,
        ]
      : []),
  ),

  mergeContent(
    jest.configFile,
    {
      extensionsToTreatAsEsm: [`.ts`, `.tsx`],
      moduleNameMapper: {'^(\\.{1,2}/.*)\\.js$': `$1`},
      transform: {'^.+\\.tsx?$': [`@swc/jest`]},
    },
    {dedupeArrays: true},
  ),

  mergeContent(
    jest.configFile,
    {testMatch: [`**/src/**/*.test.{ts,tsx}`]},
    {replaceArrays: true},
  ),

  mergeContent(npm.packageFile, {type: `module`}),

  prettier.ignore(
    configFile.path,
    ...(emit ? [emitConfigFile.path, `lib`] : []),
  ),

  mergeContent(swc.configFile, {jsc: {parser: {syntax: `typescript`}}}),

  vscode.exclude(
    configFile.path,
    ...(emit
      ? [
          emitConfigFile.path,
          emitConfigFile.path.replace(`json`, `tsbuildinfo`),
          `lib`,
        ]
      : []),
  ),

  mergeContent(vscode.settingsFile, {
    'typescript.tsdk': `node_modules/typescript/lib`,
  }),
];

typescript.exclude = (
  ...patterns: readonly (string | undefined | false)[]
): FileChange<object> =>
  mergeContent(
    configFile,
    {
      exclude: patterns.filter(
        (pattern): pattern is string => typeof pattern === `string`,
      ),
    },
    {dedupeArrays: true},
  );

typescript.mergeCompilerOptions = (
  compilerOptions: object,
): [FileChange<object>, FileChange<object>] => [
  mergeContent(configFile, {compilerOptions}),
  mergeContent(emitConfigFile, {compilerOptions}),
];

typescript.configFile = configFile;
typescript.emitConfigFile = emitConfigFile;
