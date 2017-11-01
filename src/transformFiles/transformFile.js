const traverse = require('babel-traverse').default;
const recast = require('recast');
const fs = require('fs');

const transformFile = filePath =>
	new Promise((resolve, reject) => {
		const testFile = fs.readFileSync(filePath, 'utf8');

		const AST = recast.parse(testFile, {
			sourceType: 'module',

			presets: ['latest'],
			plugins: ['jsx'],
		});

		const checkingTests = {
			path: filePath,
			changedTests: {},
		};

		traverse(AST, {
			enter(path) {
				if (
					path.isCallExpression() &&
					path.get('callee').isIdentifier({ name: 'it' })
				) {
					const testName = path.get('arguments')[0].node.value;
					path.traverse({
						CallExpression(innerPath) {
							if (innerPath.get('callee').isIdentifier({ name: 'mount' })) {
								innerPath.node.callee.name = 'shallow';
								checkingTests.changedTests[testName] = {
									file: filePath,
								};
								innerPath.skip();
							}
						},
					});
				}
			},
		});

		const output = recast.print(AST, {
			retainFunctionParens: true,
			retainLines: true,
		});

		checkingTests.testsUpdated = Object.keys(checkingTests.changedTests).length;

		if (checkingTests.testsUpdated > 0) fs.writeFileSync(filePath, output.code);
		resolve(checkingTests);
	});

module.exports = transformFile;
