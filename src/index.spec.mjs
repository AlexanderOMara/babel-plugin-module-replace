import {strictEqual, ok} from 'assert';

import * as babel from '@babel/core';

import plugin from './index';

const spec = [
	[
		'nochange',
		{
			replace: []
		},
		'nochange'
	],
	[
		'@foo/core',
		{
			replace: [['/@foo/', '@bar']]
		},
		'@bar/core'
	],
	[
		'foo',
		{
			replace: [['/^foo$/', 'bar']]
		},
		'bar'
	],
	[
		'foo-foo',
		{
			replace: [['/foo/', 'bar']]
		},
		'bar-foo'
	],
	[
		'foo-foo',
		{
			replace: [['/foo/g', 'bar']]
		},
		'bar-bar'
	],
	[
		'fOo-FoO',
		{
			replace: [[/foo/gi, 'bar']]
		},
		'bar-bar'
	],
	[
		'ABCDEFGH',
		{
			replace: [s => s.toLowerCase()]
		},
		'abcdefgh'
	],
	[
		'foo',
		{
			replace: [
				['/^foo$/', 'bar'],
				['/^bar/', 'baz']
			]
		},
		'baz'
	],
	[
		'foo',
		{
			replace: [
				['/^bar/', 'baz'],
				['/^foo$/', 'bar']
			]
		},
		'bar'
	],
	[
		'./tslib.mjs',
		{
			replace: [['/^(\\.\\.?\\/.+)\\.mjs/', '$1.js']]
		},
		'./tslib.js'
	],
	[
		'../dir/tslib.mjs',
		{
			replace: [['/^(\\.\\.?\\/.+)\\.mjs/', '$1.js']]
		},
		'../dir/tslib.js'
	],
	[
		'./tslib.ts',
		{
			replace: [[/^(\.\.?\/.+)\.ts$/, '$1.js']]
		},
		'./tslib.js'
	],
	[
		'../dir/tslib.cts',
		{
			replace: [[/^(\.\.?\/.+)\.(m|c)tsx?$/, '$1.js']]
		},
		'../dir/tslib.js'
	],
	[
		'../dir/tslib.MTSX',
		{
			replace: [[/^(\.\.?\/.+)\.(m|c)?tsx?$/i, '$1.js']]
		},
		'../dir/tslib.js'
	],
	[
		'error',
		{
			replace: [['not-a-regex', 'replaced']]
		},
		'',
		'Invalid regular expression: not-a-regex'
	]
];

function transformCode(code, opts) {
	const transform = babel.transform(code, {
		plugins: [[plugin, opts].filter(Boolean)],
		code: true,
		ast: false,
		babelrc: false,
		filename: 'code.js'
	});
	return transform.code;
}

function extractCodePath(code) {
	// Extract the import or export path.
	let m = code.match(/(import|export)[^'"]+from\s+['"]([^'"]*)['"]/);
	if (m) {
		return m[2];
	}
	m = code.match(/import\s*\(\s*(['"]([^'"]*)['"])\s*\)/);
	if (m) {
		return m[2];
	}
	return null;
}

strictEqual(typeof plugin, 'function', 'Export function');

for (const [type, gen] of [
	['import all', path => `import * as all from '${path}';`],
	['import name', path => `import {name} from '${path}';`],
	['import default', path => `import defult from '${path}';`],
	['export all', path => `export * from '${path}';`],
	['export name', path => `export {name} from '${path}';`],
	[
		'import dynamic',
		path =>
			[
				'export async function example() {',
				`    const {foo} = await import('${path}');`,
				'    return foo;',
				'}'
			].join('\n')
	]
]) {
	for (const [imp, opts, path, errmsg] of spec) {
		if (errmsg) {
			let error = null;
			try {
				transformCode(gen(imp), opts);
			} catch (err) {
				error = err;
			}
			ok(error.message.endsWith(errmsg), `${type} -> ${imp} -> ${path}`);
			continue;
		}

		const transpiled = transformCode(gen(imp), opts);
		const pathed = extractCodePath(transpiled);
		strictEqual(pathed, path, `${type} -> ${imp} -> ${path}`);
	}
}
