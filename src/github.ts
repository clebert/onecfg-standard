import type {AnyFileStatement} from 'onecfg';
import {defineYamlFile, mergeContent} from 'onecfg';
import {node} from './node.js';
import {vscode} from './vscode.js';

export interface GithubOptions {
  readonly branches?: readonly string[];
  readonly omitReleaseStep?: boolean;
}

const ciFile = defineYamlFile(`.github/workflows/ci.yml`, {});

export const github = ({
  branches = [`main`],
  omitReleaseStep,
}: GithubOptions = {}): readonly AnyFileStatement[] => [
  ciFile,

  mergeContent(
    ciFile,
    {
      name: `CI`,
      on: {
        push: {branches},
        pull_request: {branches},
        ...(!omitReleaseStep ? {release: {types: [`published`]}} : {}),
      },
      jobs: {
        ci: {
          'runs-on': `ubuntu-latest`,
          'steps': [
            {name: `Checkout repository`, uses: `actions/checkout@v2`},
            {
              name: `Setup Node.js`,
              uses: `actions/setup-node@v2`,
              with: {'node-version-file': node.versionFile.path},
            },
            {name: `Install dependencies`, uses: `bahmutov/npm-install@v1`},
            {name: `Run CI checks`, run: `npm run ci`},
            ...(!omitReleaseStep
              ? [
                  {
                    name: `Publish to npm`,
                    if: `\${{ github.event_name == 'release' }}`,
                    env: {NPM_AUTH_TOKEN: `\${{ secrets.NPM_AUTH_TOKEN }}`},
                    run: `npm config set //registry.npmjs.org/:_authToken $NPM_AUTH_TOKEN\nnpm publish\n`,
                  },
                ]
              : []),
          ],
        },
      },
    },
    {priority: -1},
  ),

  mergeContent(vscode.settingsFile, {'files.exclude': {'.github': true}}),
];

github.ciFile = ciFile;
