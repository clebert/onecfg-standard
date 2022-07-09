import {mergeContent, writeFiles} from 'onecfg';
import {
  editorconfig,
  eslint,
  git,
  github,
  jest,
  node,
  npm,
  prettier,
  swc,
  typescript,
  vscode,
  wallaby,
} from './lib/index.js';

const target = `es2022`;

writeFiles(
  ...editorconfig(),
  ...eslint(),
  ...git(),
  ...github(),
  ...jest(),
  ...node({nodeVersion: `18`}),
  ...npm(),
  ...prettier(),
  ...swc({target}),
  ...typescript({target, emit: true}),
  ...vscode({includeFilesInExplorer: false}),
  ...wallaby(),

  mergeContent(npm.packageFile, {
    scripts: {
      preprepare: `tsc --declaration --esModuleInterop --module node16 --outDir lib src/index.ts`,
    },
  }),
);
