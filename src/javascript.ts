import type {AnyFileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {eslint} from './eslint.js';
import {jest} from './jest.js';
import {swc} from './swc.js';
import {typescript} from './typescript.js';

export interface JavascriptOptions {
  readonly target:
    | {
        readonly ecmaVersion: EcmaVersion;
        readonly moduleType: 'commonjs';
      }
    | {
        readonly ecmaVersion: EcmaVersion;
        readonly moduleType: 'es2015' | 'es2020' | 'es2022';
        readonly node?: boolean;
      };

  readonly source?: {
    readonly ecmaVersion: EcmaVersion;
    readonly moduleType: 'commonjs' | 'es2015' | 'es2020' | 'es2022';
  };
}

export type EcmaVersion =
  | 'es3'
  | 'es5'
  | 'es2015' // 6
  | 'es2016' // 7
  | 'es2017' // 8
  | 'es2018' // 9
  | 'es2019' // 10
  | 'es2020' // 11
  | 'es2021' // 12
  | 'es2022'; // 13;

export const javascript = ({
  target,
  source = target,
}: JavascriptOptions): readonly AnyFileStatement[] => [
  mergeContent(eslint.configFile, {
    parserOptions: {
      ecmaVersion: parseInt(source.ecmaVersion.slice(2), 10),
      sourceType: source.moduleType === `commonjs` ? `script` : `module`,
    },
    rules: {
      'import/extensions':
        target.moduleType !== `commonjs` && target.node
          ? [`error`, `always`, {ignorePackages: true}]
          : `off`,
    },
    overrides: [
      {
        files: [`src/**/*.ts`, `src/**/*.tsx`],
        rules: {
          '@typescript-eslint/no-require-imports':
            target.moduleType !== `commonjs` ? `error` : `off`,
        },
      },
    ],
  }),

  mergeContent(
    jest.configFile,
    target.moduleType !== `commonjs` && target.node
      ? {
          extensionsToTreatAsEsm: [`.ts`, `.tsx`],
          moduleNameMapper: {'^(\\.{1,2}/.*)\\.js$': `$1`},
        }
      : {},
  ),

  mergeContent(swc.configFile, {
    jsc: {target: target.ecmaVersion},
    module: {type: target.moduleType === `commonjs` ? `commonjs` : `es6`},
  }),

  mergeContent(typescript.configFile, {
    compilerOptions: {module: target.moduleType, target: target.ecmaVersion},
  }),
];
