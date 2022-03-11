import type {AnyFileStatement} from 'onecfg';
import {defineJsonFile, mergeContent} from 'onecfg';
import {git} from './git.js';
import {prettier} from './prettier.js';

export interface VscodeOptions {
  readonly showAllFilesInEditor?: boolean;
}

const extensionsFile = defineJsonFile(`.vscode/extensions.json`, {});
const settingsFile = defineJsonFile(`.vscode/settings.json`, {});

/** https://code.visualstudio.com */
export const vscode = ({
  showAllFilesInEditor,
}: VscodeOptions = {}): readonly AnyFileStatement[] => [
  extensionsFile,
  settingsFile,

  mergeContent(
    settingsFile,
    {'files.exclude': {'**/.DS_Store': true, '.vscode': true}},
    {priority: -1},
  ),

  mergeContent(
    settingsFile,
    showAllFilesInEditor ? {'files.exclude': undefined} : {},
    {priority: 1},
  ),

  mergeContent(git.ignoreFile, [extensionsFile.path, settingsFile.path]),
  mergeContent(prettier.ignoreFile, [extensionsFile.path, settingsFile.path]),
];

vscode.extensionsFile = extensionsFile;
vscode.settingsFile = settingsFile;
