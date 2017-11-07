// @flow

const jestish = require('jest-cli');
const HasteMap = require('jest-haste-map');

const findTestFiles = config => {
	const newMap = new HasteMap(config.hasteConfig);
	return newMap
		.build()
		.then(({ hasteFS }) => {
			const ourSearch = new jestish.SearchSource({
				hasteFS,
				rootDir: config.currentDir,
				config: config.searchConfig,
			});

			return ourSearch.getTestPaths({
				testPathPattern: config.testPathPattern,
			});
		})
		.then(({ tests }) => tests.map(({ path }) => path));
};

module.exports = findTestFiles;
