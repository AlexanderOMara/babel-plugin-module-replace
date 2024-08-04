/**
 * Get RegExp from string or regular expression object.
 *
 * @param {string|RegExp} reg Regular expression object or string.
 * @returns {RegExp} Converted regular expression.
 */
function toRegExp(reg) {
	if (typeof reg === 'string') {
		const m = reg.match(/^\/([\s\S]*)\/([a-z]*)$/);
		if (!m) {
			throw new Error(`Invalid regular expression: ${reg}`);
		}
		return new RegExp(m[1], m[2]);
	}
	return reg;
}

/**
 * Replace source.
 *
 * @param {string} src Source path.
 * @param {object} state AST state.
 * @returns {string} Relaced path.
 */
function replaceSource(src, state) {
	const {opts} = state;
	const replace = (opts && opts.replace) || [];
	for (const repl of replace) {
		if (Array.isArray(repl)) {
			src = src.replace(toRegExp(repl[0]), repl[1]);
		} else {
			src = repl(src);
		}
	}
	return src;
}

/**
 * Babel plugin entry point.
 *
 * @returns {object} Plugin methods.
 */
export default () => ({
	visitor: {
		/**
		 * Visitor callback for import declarations.
		 *
		 * @param {object} path AST node.
		 * @param {object} state AST state.
		 */
		ImportDeclaration(path, state) {
			const {source} = path.node;
			source.value = replaceSource(source.value, state);
		},

		/**
		 * Visitor callback for export all declarations.
		 *
		 * @param {object} path AST node.
		 * @param {object} state AST state.
		 */
		ExportAllDeclaration(path, state) {
			const {source} = path.node;
			source.value = replaceSource(source.value, state);
		},

		/**
		 * Visitor callback for export named declarations.
		 *
		 * @param {object} path AST node.
		 * @param {object} state AST state.
		 */
		ExportNamedDeclaration(path, state) {
			const {source} = path.node;
			if (source) {
				source.value = replaceSource(source.value, state);
			}
		},

		/**
		 * Visitor callback for call expression (for dynamic imports).
		 *
		 * @param {object} path AST node.
		 * @param {object} state AST state.
		 */
		CallExpression(path, state) {
			// Only transform dynamic imports with a string literal.
			const {node} = path;
			const {callee} = node;
			if (callee && callee.type === 'Import') {
				const [arg0] = node.arguments;
				if (arg0 && arg0.type === 'StringLiteral') {
					arg0.value = replaceSource(arg0.value, state);
				}
			}
		}
	}
});
