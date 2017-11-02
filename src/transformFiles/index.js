const pLimit = require('p-limit');

const transformFile = require('./transformFile');
const reshapeTestData = require('./reshapeTestData');

const transformFiles = async filePaths => {
	const limit = pLimit(1);
	return Promise.all(
		filePaths.map(path => limit(() => transformFile(path)))
	).then(reshapeTestData);
};

module.exports = transformFiles;
