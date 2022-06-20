# @onecfg/standard

Opinionated defaults for generating config files with
[onecfg](https://github.com/clebert/onecfg).

## Installation

```
npm install @onecfg/standard
```

## Create a `onecfg.js` file

```js
import {writeFiles} from 'onecfg';
```

### Basic configuration

```js
import {editorconfig, git, node, npm, vscode} from '@onecfg/standard';

writeFiles(
  ...editorconfig(),
  ...git(),
  ...node({nodeVersion: '18'}),
  ...npm(),
  ...vscode({includeFilesInExplorer: false}),
);
```

Injects the following `package.json` script:

- `prepare`

### Prettier configuration

```js
import {prettier} from '@onecfg/standard';

writeFiles(
  // ... basic configuration
  ...prettier(),
);
```

Injects the following `package.json` scripts:

- `format:check`
- `format:write`

Requires the following npm dev dependency:

- `prettier`

### ESLint configuration

```js
import {eslint} from '@onecfg/standard';

writeFiles(
  // ... basic configuration
  ...eslint(),
);
```

Injects the following `package.json` script:

- `lint`

Requires the following npm dev dependencies:

- `eslint`
- `eslint-config-prettier` (if `prettier()` is configured)
- `eslint-plugin-import`
- `eslint-plugin-markdown`
- `@typescript-eslint/eslint-plugin` (if `typescript()` is configured)
- `@typescript-eslint/parser` (if `typescript()` is configured)

### TypeScript configuration

```js
import {typescript} from '@onecfg/standard';

writeFiles(
  // ... basic configuration
  ...typescript({target: 'es2022', emit: true}),
);
```

Injects the following `package.json` scripts:

- `compile:check`
- `compile:emit` (if `emit` is enabled)

Requires the following npm dev dependency:

- `typescript`

### Jest configuration

```js
import {jest} from '@onecfg/standard';

writeFiles(
  // ... basic configuration
  ...jest(),
);
```

If you write your tests using TypeScript, you also need to configure
[SWC](https://swc.rs):

```js
import {jest, swc, typescript} from '@onecfg/standard';

const target = 'es2022';

writeFiles(
  // ... basic configuration
  ...jest(),
  ...swc({target}),
  ...typescript({target}),
);
```

Injects the following `package.json` script:

- `test`

Requires the following npm dev dependencies:

- `jest`
- `@swc/core` (if `swc()` is configured)
- `@swc/jest` (if `swc()` is configured)

### React configuration

```js
import {react, swc, typescript} from '@onecfg/standard';

const target = 'es2019';

writeFiles(
  // ... basic configuration
  ...react(),
  ...swc({target}),
  ...typescript({target}),
);
```

### Preact configuration

```js
import {preact, swc, typescript} from '@onecfg/standard';

const target = 'es2019';

writeFiles(
  // ... basic configuration
  ...preact(),
  ...swc({target}), // optional
  ...typescript({target}), // optional
);
```
