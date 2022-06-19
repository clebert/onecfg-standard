import type {FileChange, FileStatement} from 'onecfg';
import {defineTextFile, mergeContent} from 'onecfg';
import {headerComment} from './header-comment.js';
import {typescript} from './typescript.js';
import {vscode} from './vscode.js';

const ignoreFile = defineTextFile(`.gitignore`, [`# ${headerComment}`]);

/** https://git-scm.com */
export const git = (): readonly FileStatement[] => [
  ignoreFile,
  typescript.exclude(`.git`),
  vscode.exclude(`.git`, ignoreFile.path),
];

git.ignore = (
  ...patterns: readonly (string | undefined | false)[]
): FileChange<readonly string[]> =>
  mergeContent(
    ignoreFile,
    patterns.filter(
      (pattern): pattern is string => typeof pattern === `string`,
    ),
    {dedupeArrays: true},
  );

git.ignoreFile = ignoreFile;
