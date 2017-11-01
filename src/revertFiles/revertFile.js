const traverse = require('babel-traverse').default;
const recast = require('recast');
const fs = require('fs');

const revertFile = (filePath, toRevert) =>
	new Promise((resolve, reject) => {
		const testFile = fs.readFileSync(filePath, 'utf8');

		const AST = recast.parse(testFile, {
			sourceType: 'module',

			plugins: ['jsx'],
		});

		const checkingTests = {};

		traverse(AST, {
			enter(path) {
				if (
					path.isCallExpression() &&
					path.get('callee').isIdentifier({ name: 'it' })
				) {
					const testName = path.get('arguments')[0].node.value;
					if (toRevert[testName]) {
						path.traverse({
							CallExpression(innerPath) {
								if (innerPath.get('callee').isIdentifier({ name: 'shallow' })) {
									innerPath.node.callee.name = 'mount';
									checkingTests[testName] = {
										changed: true,
									};
									innerPath.skip();
								}
							},
						});
					}
				}
			},
		});

		const output = recast.print(AST);

		fs.writeFileSync(filePath, output.code);
		resolve(checkingTests);
	});

module.exports = revertFile;
