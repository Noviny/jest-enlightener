# Jest Enlightener

Jest Enlightener works to make your test suite faster, 'lighter', by finding the tests that don't need to be as complex as they are, and modifying them.

Currently, Jest Enlightener is designed to optimize enzyme testing by finding places where you are calling 'mount', and replacing them where possible with 'shallow'. Shallow rendering components can be vastly more efficient when you were mounting components with many children, and this can speed up your test runs.

## What it does

Pass in your jest options to the Enlightener using '--c' or '-config', accepting the same options as jest. The enlightener will parse all files and then rewrite any instances of mount to shallow, attempt to run tests again, and revert ones that failed, while leaving ones that still passed.

## How to use

### Global Install

```
npm intall --global jest-enlightener
```

or

```
yarn add global jest-enlightener
```

From here you can run the global command to update your tests.

### Project Install

```
npm install jest-enlightener
```

or

```
yarn add jest-enlightener
```

In your `package.json` add a script `"enlighten": "jest-enlightener"`

If you plan to make this check regular, you should install it locally, otherwise you should install it globally and run it as desired.

## Command Line args

### `-config` (--c)

Provide a jest config, either as a string or as a path. See the [jest documentation](https://facebook.github.io/jest/docs/en/cli.html#config-path) for more information on what can be passed here.

### `-testRegex` (--t)

A string representing a regex expression, passed to jest [like so](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string). This option allows you to easily pass in what files you want tested without passing in a full config.

### testCommand

Command to be implemented to allow mocha tests to be enlightened as well, replacing the running of jest with a custom function.

### resultsParser

Command to be implemented to allow mocha tests to be enlightened as well, parsing of the test results with a custom output. They will need to return an array of tests that need to be reverted.

## Will this take forever to do?

How long this takes will depend on your test suite, however should not be too troublesome (10 000 calls to shallow take about 4 seconds, and we only run shallows in updating the project). What is more, we only run files that we change, so much of your test-suite may be skipped if it doesn't need updating.
