const jestCli = require('jest-cli');

const runTests = config => {
	const opts = Object.assign({}, config.customConfig);
	return jestCli.runCLI(opts, [config.currentDir]);
};

module.exports = runTests;
