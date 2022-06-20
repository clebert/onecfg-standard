import type {FileStatement} from 'onecfg';
import {defineYamlFile, mergeContent, replaceContent} from 'onecfg';
import {headerComment} from './header-comment.js';
import {node} from './node.js';
import {npm} from './npm.js';
import {typescript} from './typescript.js';
import {vscode} from './vscode.js';

export interface GithubOptions {
  readonly branches?: readonly string[];
  readonly omitReleaseStep?: boolean;
  readonly additionalCiScripts?: readonly string[];
}

const ciFile = defineYamlFile(`.github/workflows/ci.yml`, {}, {headerComment});

export const github = ({
  branches = [`main`],
  omitReleaseStep,
  additionalCiScripts = [],
}: GithubOptions = {}): readonly FileStatement[] => [
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

  replaceContent(
    npm.packageFile,
    (content) => {
      const {scripts} = content as Record<string, unknown>;

      if (!scripts || typeof scripts !== `object`) {
        return content;
      }

      const ciScripts = [
        ...Object.entries(scripts)
          .filter(
            ([key, value]) =>
              [
                `compile:check`,
                `compile:emit`,
                `format:check`,
                `lint`,
                `test`,
              ].includes(key) && value,
          )
          .map(([key]) => key)
          .sort(),

        ...additionalCiScripts,
      ];

      if (ciScripts.length === 0) {
        return content;
      }

      return {
        ...content,
        scripts: {...scripts, ci: [`run-p`, ...ciScripts].join(` `)},
      };
    },
    {priority: 1},
  ),

  ...(!omitReleaseStep
    ? [
        mergeContent(npm.packageFile, {
          scripts: {
            release: `npm version`,
            postrelease: `git push --follow-tags`,
          },
        }),
      ]
    : []),

  typescript.exclude(`.github`),
  vscode.exclude(`.github`),
];

github.ciFile = ciFile;
