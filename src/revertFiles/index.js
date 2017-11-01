const revertFile = require('./revertFile');
const pLimit = require('p-limit');

const revertFiles = async (filePaths, filteredResults, config) => {
	const limit = pLimit(5);
	return Promise.all(
		filePaths.map(path =>
			limit(() => {
				if (config.customConfig.testPathIgnorePatterns.includes(path))
					return Promise.resolve();
				return revertFile(path, filteredResults);
			})
		)
	).then(a => a);
};

module.exports = revertFiles;
