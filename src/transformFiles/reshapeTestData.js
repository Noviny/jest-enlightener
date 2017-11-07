// @flow

const reshapeTestData = testFiles =>
	testFiles.reduce(
		(acc, testFile) => {
			if (testFile.testsUpdated < 1) {
				acc.testPathIgnorePatterns.push(testFile.path);
				return acc;
			}
			acc.totalUpdatedTests += testFile.testsUpdated;
			acc.filesToTest.push(testFile.path);
			acc.testFileData[testFile.path] = testFile.changedTests;
			return acc;
		},
		{
			totalUpdatedTests: 0,
			filesToTest: [],
			testPathIgnorePatterns: [],
			testFileData: {},
		}
	);

module.exports = reshapeTestData;
