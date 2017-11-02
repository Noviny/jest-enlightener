const traverse = require('babel-traverse').default;
const recast = require('recast');
const fs = require('fs');
const t = require('babel-types');

const transformFile = filePath => {
	return new Promise((resolve, reject) => {
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

		let addShallow = false;

		traverse(AST, {
			CallExpression: {
				enter(path) {
					if (path.get('callee').isIdentifier({ name: 'it' })) {
						const testName = path.get('arguments')[0].node.value;
						path.traverse({
							CallExpression(innerPath) {
								if (innerPath.get('callee').isIdentifier({ name: 'mount' })) {
									if (!path.scope.hasBinding('shallow')) addShallow = true;
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
			},
		});

		checkingTests.testsUpdated = Object.keys(checkingTests.changedTests).length;

		if (checkingTests.testsUpdated > 0) {
			if (addShallow) {
				traverse(AST, {
					ImportDeclaration: {
						enter(path) {
							if (path.get('source').node.value === 'enzyme') {
								const imports = path.get('specifiers');
								const shallowSpec = t.importSpecifier(
									t.identifier('shallow'),
									t.identifier('shallow')
								);
								imports[0].insertAfter(shallowSpec);
							}
						},
					},
				});
			}

			const output = recast.print(AST, {
				retainFunctionParens: true,
				retainLines: true,
			});

			fs.writeFileSync(filePath, output.code);
		}
		resolve(checkingTests);
	}).catch(e => ({ path: filePath, changedTests: {}, testsUpdated: 0 }));
};

module.exports = transformFile;
