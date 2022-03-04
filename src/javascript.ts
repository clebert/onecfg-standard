import type {AnyFileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {eslint} from './eslint.js';
import {jest} from './jest.js';
import {swc} from './swc.js';
import {typescript} from './typescript.js';

export interface JavascriptOptions {
  readonly ecmaVersion:
    | 'es3'
    | 'es5'
    | 'es2015' // 6
    | 'es2016' // 7
    | 'es2017' // 8
    | 'es2018' // 9
    | 'es2019' // 10
    | 'es2020' // 11
    | 'es2021' // 12
    | 'es2022'; // 13

  readonly moduleType: 'commonjs' | 'es2015' | 'es2020' | 'es2022';
}

export const javascript = ({
  ecmaVersion,
  moduleType,
}: JavascriptOptions): readonly AnyFileStatement[] => [
  mergeContent(eslint.configFile, {
    parserOptions: {
      ecmaVersion: parseInt(ecmaVersion.slice(2), 10),
      sourceType: moduleType === `commonjs` ? `script` : `module`,
    },
    rules: {
      'import/extensions':
        moduleType !== `commonjs`
          ? [`error`, `always`, {ignorePackages: true}]
          : `off`,
    },
  }),

  mergeContent(
    jest.configFile,
    moduleType !== `commonjs`
      ? {
          extensionsToTreatAsEsm: [`.ts`, `.tsx`],
          moduleNameMapper: {'^(\\.{1,2}/.*)\\.js$': `$1`},
        }
      : {},
  ),

  mergeContent(swc.configFile, {
    jsc: {target: ecmaVersion},
    module: {type: moduleType === `commonjs` ? `commonjs` : `es6`},
  }),

  mergeContent(typescript.configFile, {
    compilerOptions: {module: moduleType, target: ecmaVersion},
  }),
];
