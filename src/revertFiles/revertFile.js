const traverse = require('babel-traverse').default;
const recast = require('recast');
const t = require('babel-types');
const fs = require('fs');

const revertFile = (filePath, toRevert) =>
	new Promise((resolve, reject) => {
		const testFile = fs.readFileSync(filePath, 'utf8');

		const AST = recast.parse(testFile, {
			sourceType: 'module',

			plugins: ['jsx'],
		});

		const checkingTests = {};

		let hasMount = false;
		let hasShallow = false;
		let needsMount = false;
		let needsShallow = false;

		traverse(AST, {
			CallExpression: {
				enter(path) {
					if (path.get('callee').isIdentifier({ name: 'it' })) {
						const testName = path.get('arguments')[0].node.value;
						path.traverse({
							CallExpression(innerPath) {
								if (innerPath.get('callee').isIdentifier({ name: 'shallow' })) {
									if (toRevert[testName]) {
										innerPath.node.callee.name = 'mount';
										checkingTests[testName] = {
											changed: true,
										};
									} else {
										needsShallow = true;
									}
								}
								if (innerPath.get('callee').isIdentifier({ name: 'mount' })) {
									needsMount = true;
								}
							},
						});
					}
				},
			},
			ImportDeclaration: {
				enter(path) {
					if (path.get('source').node.value === 'enzyme') {
						const imports = path.get('specifiers');
						imports.forEach(importer => {
							if (importer.node.local.name === 'mount') hasMount = true;
							if (importer.node.local.name === 'shallow') hasShallow = true;
						});
					}
				},
			},
		});

		traverse(AST, {
			CallExpression: {
				enter(path) {
					if (path.get('callee').isIdentifier({ name: 'it' })) {
						path.traverse({
							CallExpression(innerPath) {
								if (innerPath.get('callee').isIdentifier({ name: 'shallow' })) {
									needsShallow = true;
								}
								if (innerPath.get('callee').isIdentifier({ name: 'mount' })) {
									needsMount = true;
								}
							},
						});
					}
				},
			},
		});

		const addMount = !hasMount && needsMount;
		const addShallow = !hasShallow && needsShallow;

		traverse(AST, {
			ImportDeclaration: {
				enter(path) {
					if (path.get('source').node.value === 'enzyme') {
						const imports = path.get('specifiers');
						if (addMount)
							imports[0].insertAfter(
								t.importSpecifier(t.identifier('mount'), t.identifier('mount'))
							);
						if (addShallow)
							imports[0].insertAfter(
								t.importSpecifier(
									t.identifier('shallow'),
									t.identifier('shallow')
								)
							);
						path.traverse({
							ImportSpecifier: {
								enter(importPath) {
									if (importPath.node.local.name === 'mount' && !needsMount)
										return importPath.remove();
									if (importPath.node.local.name === 'shallow' && !needsShallow)
										return importPath.remove();
								},
							},
						});
					}
				},
			},
		});

		const output = recast.print(AST);

		fs.writeFileSync(filePath, output.code);
		resolve(checkingTests);
	});

module.exports = revertFile;
