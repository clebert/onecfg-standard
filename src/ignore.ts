import type {FileChange} from 'onecfg';
import {eslint} from './eslint.js';
import {git} from './git.js';
import {prettier} from './prettier.js';
import {typescript} from './typescript.js';
import {vscode} from './vscode.js';

export type IgnorePattern = string | [string, IgnorePatternOptions];

export interface IgnorePatternOptions {
  readonly noGitIgnore?: boolean;
  readonly noEslintIgnore?: boolean;
  readonly noPrettierIgnore?: boolean;
  readonly noTypescriptExclude?: boolean;
  readonly noVscodeExclude?: boolean;
}

export function ignore(
  ...patterns: readonly IgnorePattern[]
): readonly FileChange<any>[] {
  const fileChanges: FileChange<any>[] = [];

  for (let pattern of patterns) {
    if (typeof pattern === `string`) {
      fileChanges.push(
        git.ignore(pattern),
        eslint.ignore(pattern),
        prettier.ignore(pattern),
        typescript.exclude(pattern),
        vscode.exclude(pattern),
      );
    } else {
      const {
        noGitIgnore,
        noEslintIgnore,
        noPrettierIgnore,
        noTypescriptExclude,
        noVscodeExclude,
      } = pattern[1];

      pattern = pattern[0];

      if (!noGitIgnore) {
        fileChanges.push(git.ignore(pattern));
      }

      if (!noEslintIgnore) {
        fileChanges.push(eslint.ignore(pattern));
      }

      if (!noPrettierIgnore) {
        fileChanges.push(prettier.ignore(pattern));
      }

      if (!noTypescriptExclude) {
        fileChanges.push(typescript.exclude(pattern));
      }

      if (!noVscodeExclude) {
        fileChanges.push(vscode.exclude(pattern));
      }
    }
  }

  return fileChanges;
}
