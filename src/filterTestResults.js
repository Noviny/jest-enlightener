// @flow

const filterTestResults = (testFileData, results) => {
	if (results.numFailedTests < 1) return {};

	let toRevert = {};

	results.testResults.forEach(({ testFilePath, testResults }) => {
		const relevantTests = testFileData.testFileData[testFilePath];
		testResults.forEach(test => {
			if (relevantTests[test.title] && test.status === 'failed') {
				toRevert[test.title] = { file: testFilePath };
			}
		});
	});

	return toRevert;
};

module.exports = filterTestResults;
