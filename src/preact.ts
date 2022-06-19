import type {FileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {swc} from './swc.js';
import {typescript} from './typescript.js';

export const preact = (): readonly FileStatement[] => [
  mergeContent(swc.configFile, {
    jsc: {
      parser: {tsx: true},
      transform: {react: {importSource: `preact`, runtime: `automatic`}},
    },
  }),

  mergeContent(typescript.configFile, {
    compilerOptions: {jsx: `react-jsx`, jsxImportSource: `preact`},
  }),

  mergeContent(typescript.emitConfigFile, {
    compilerOptions: {jsx: `react-jsx`, jsxImportSource: `preact`},
  }),
];
