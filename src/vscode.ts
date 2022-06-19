import type {FileChange, FileStatement} from 'onecfg';
import {defineJsonFile, mergeContent} from 'onecfg';
import {git} from './git.js';
import {prettier} from './prettier.js';
import {typescript} from './typescript.js';

export interface VscodeOptions {
  readonly includeFilesInExplorer?: boolean;
}

const extensionsFile = defineJsonFile(`.vscode/extensions.json`, {});
const settingsFile = defineJsonFile(`.vscode/settings.json`, {});

/** https://code.visualstudio.com */
export const vscode = ({
  includeFilesInExplorer,
}: VscodeOptions = {}): readonly FileStatement[] => [
  extensionsFile,
  settingsFile,

  mergeContent(
    settingsFile,
    {
      'editor.codeActionsOnSave': {'source.addMissingImports': true},
      'explorer.excludeGitIgnore': true,
      'files.exclude': {'**/.DS_Store': true, '.vscode': true},
    },
    {priority: -1},
  ),

  mergeContent(
    settingsFile,
    includeFilesInExplorer
      ? {'explorer.excludeGitIgnore': false, 'files.exclude': undefined}
      : {},
    {priority: 1},
  ),

  git.ignore(`.vscode`),
  prettier.ignore(`.vscode`, extensionsFile.path, settingsFile.path),
  typescript.exclude(`.vscode`),
];

vscode.addExtensions = (...extensions: readonly string[]): FileChange<object> =>
  mergeContent(
    extensionsFile,
    {recommendations: extensions},
    {dedupeArrays: true},
  );

vscode.exclude = (
  ...patterns: readonly (string | undefined | false)[]
): FileChange<object> =>
  mergeContent(settingsFile, {
    'files.exclude': Object.fromEntries(
      patterns
        .filter((pattern): pattern is string => typeof pattern === `string`)
        .map((pattern) => [pattern, true]),
    ),
  });

vscode.extensionsFile = extensionsFile;
vscode.settingsFile = settingsFile;
