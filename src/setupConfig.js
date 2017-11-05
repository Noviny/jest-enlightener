const currentDir = process.cwd();
const path = require('path');

const getTestRegex = (customConfig, args) =>
	(customConfig && customConfig.testRegex) ||
	args.testRegex ||
	'(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$';
const sanitizeJestOptions = args => ({ ...args, _: undefined, $0: undefined });
const updateCustomConfig = customConfig => {
	if (!customConfig) {
		customConfig = {
			rootDir: currentDir,
		};
	}
	return customConfig;
};

const setupConfig = args => {
	let customConfig;
	if (args.config) {
		customConfig = require(path.resolve(currentDir, args.config));
	}

	return {
		jestOptions: sanitizeJestOptions(args),
		customConfigPath: args.config,
		customConfig: updateCustomConfig(customConfig),
		currentDir,
		testRegex: getTestRegex(customConfig, args),
		testPathPattern: '',
		hasteConfig: {
			extensions: ['js', 'json'],
			maxWorkers: 1,
			ignorePattern: () => {},
			platforms: [],
			roots: [currentDir],
		},
		searchConfig: {
			roots: [],
			testPathIgnorePatterns: [],
			testRegex: getTestRegex(customConfig, args),
		},
	};
};

module.exports = setupConfig;
