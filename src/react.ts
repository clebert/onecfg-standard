import type {FileStatement} from 'onecfg';
import {mergeContent} from 'onecfg';
import {swc} from './swc.js';
import {typescript} from './typescript.js';

export const react = (): readonly FileStatement[] => [
  mergeContent(swc.configFile, {jsc: {parser: {tsx: true}}}),
  ...typescript.mergeCompilerOptions({jsx: `react`}),
];
