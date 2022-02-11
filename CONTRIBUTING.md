# Contributor Guidelines

## Getting Started

We recommend using [Visual Studio Code](https://code.visualstudio.com/) as an editor, which will recommend some editor extensions on first load.

- `npm install` to install required dependencies
- `npm run build` to lint and build everything including docs
- `npm run lint` to lint source
- `npm run test` to run tests using jest
- `npm run action-test` to test using the local action runtime - requires [act](https://github.com/nektos/act)
- `npm version <newversion>` updates the version of this package
- `npm audit` to audit dependencies for vulnerabilities
- `npm publish --dry-run` to see what files would get published to npm
- `npm publish` to actually publish to npm. Ensure you `build` beforehand!

## Configuration Details

Our codebase is written in [Typescript](https://www.typescriptlang.org/) and published as `js` with `.d.ts` files and `sourcemaps`.
We use [babel](https://babeljs.io/) for our tests, as-per [jest recommendations](https://jestjs.io/docs/getting-started#using-typescript).
We use [eslint](https://eslint.org/) and [prettier](https://prettier.io/) together for linting.

When jest tests are run, code coverage data is generated to `coverage/` and is pretty-printed in the test output.

### Testing

We have decent test coverage for this project, as well as a set of fixture (e2e) tests for each supported `mode`. These currently live in `src/__fixtures__` and are snapshot tests.

## Continuous Integration

> Note: We are investigating using [Release Please](https://github.com/googleapis/release-please) for CD.

CI will run the following commands in sequence:

- `npm install`
- `npm run build` (implies `lint`)
- `npm run test` (implies generation of code coverage stats)
- `npm audit`

In addition to the above, CD will run the following when it's releasing:

- `npm version <newversion>`
- `npm publish`
