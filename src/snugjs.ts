import type {FileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {swc} from './swc.js';
import {typescript} from './typescript.js';

export const snugjs = (): readonly FileStatement[] => [
  mergeContent(swc.configFile, {
    jsc: {
      parser: {tsx: true},
      transform: {
        react: {pragma: `createElement`, pragmaFrag: `createFragment`},
      },
    },
  }),

  ...typescript.mergeCompilerOptions({
    jsx: `react`,
    jsxFactory: `createElement`,
    jsxFragmentFactory: `createFragment`,
  }),
];
