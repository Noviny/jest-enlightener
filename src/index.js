#! /usr/bin/env node
// @flow

const argv = require('yargs')
	.option('config', {
		alias: 'c',
		default: false,
	})
	.option('testCommand', {
		alias: 'tc',
		default: undefined,
	})
	.option('resultParser', {
		alias: 'r',
		default: undefined,
	})
	.option('testRegex', {
		alias: 't',
		default: undefined,
	}).argv;

const setupConfig = require('./setupConfig');
const findTestFiles = require('./findTestFiles');
const transformFiles = require('./transformFiles');
const runTestFiles = require('./runTestFiles');
const filterTestResults = require('./filterTestResults');
const revertFiles = require('./revertFiles');
const generateReport = require('./generateReport');

const addIgnoredFilesToConfig = (requiredTests, config) => {
	if (!config.customConfig.testPathIgnorePatterns)
		config.customConfig.testPathIgnorePatterns = [];
	config.customConfig.testPathIgnorePatterns = config.customConfig.testPathIgnorePatterns.concat(
		requiredTests.testPathIgnorePatterns
	);
	return requiredTests;
};

const enlighten = async () => {
	const config = setupConfig(argv);
	const filePaths = await findTestFiles(config);

	// TODO: Run tests to make sure they are passing beforehand, so we don't get false negatives
	const testFileData = await transformFiles(filePaths);

	if (testFileData.totalUpdatedTests < 1)
		return `We found no tests that we could update.`;

	// TODO stop this having these random side effects
	addIgnoredFilesToConfig(testFileData, config);
	const { results } = await runTestFiles(config);
	const toRevert = filterTestResults(testFileData, results);
	await revertFiles(filePaths, toRevert, testFileData, config);

	return generateReport(toRevert, testFileData);
};

enlighten()
	.then(report => console.log('✨  finished enlightenment ✨', report))
	.catch(e => console.log('enlightenment failed', e));
