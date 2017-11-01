const currentDir = process.cwd();
const path = require('path');

// This is currently hardcoded for atlaskit. Default should be the jest default
const getTestRegex = (customConfig, args) =>
	(customConfig && customConfig.testRegex) || args.testRegex || 'FAILSAFE';
const sanitizeJestOptions = args => ({ ...args, _: undefined, $0: undefined });
const updateCustomConfig = customConfig => {
	if (!customConfig) {
		customConfig = {
			rootDir: currentDir,
		};
	}
	// customConfig.reporters = [
	//   `${__dirname}/testReporter.js`,
	// ]
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
