# Contributing

When it comes to open source, there are different ways you can contribute, all
of which are valuable. Here's few guidelines that should help you as you prepare
your contribution.

## Initial steps

Before you start working on a contribution, create an issue describing what you want to build. It's possible someone else is already working on something similar, or perhaps there is a reason that feature isn't implemented. The maintainers will point you in the right direction.

## Development

The following steps will get you setup to contribute changes to this repo:

1. Fork this repo.

2. Clone your forked repo: `git clone git@github.com:{your_username}/eck.git`

3. Run `pnpm` to install dependencies.

### Commands

**`pnpm build`**

- generates a minified version of the source as `validator.min.js`

**`pnpm test`**

- runs all Vitest tests

**`pnpm coverage`**

- runs all Vitest tests and generates a code coverage report

**`pnpm test index`**

- runs a single test file (e.g. `./test/index.test.ts`)

**`pnpm bench`**

- runs `bench.ts` which outputs a basic benchmark against a few other validation libraries

### Tests

Eck uses Jest for testing. After implementing your contribution, write tests for it. Just create a new file inside `./test` or add additional tests to the appropriate existing file.

Before submitting your PR, run `pnpm test` to make sure there are no (unintended) breaking changes.

### Documentation

The Eck documentation (will eventually) live in the README.md. Be sure to document any API changes you implement.

## License

By contributing your code to the eck GitHub repository, you agree to
license your contribution under the MIT license.
