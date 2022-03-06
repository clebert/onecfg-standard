import type {AnyFileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {swc} from './swc.js';
import {typescript} from './typescript.js';

export const preact = (): readonly AnyFileStatement[] => [
  mergeContent(swc.configFile, {jsc: {parser: {tsx: true}}}),

  mergeContent(typescript.configFile, {
    compilerOptions: {jsx: `react-jsx`, jsxImportSource: `preact`},
  }),
];
