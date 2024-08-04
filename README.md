# Babel Plugin: Module Replace

A Babel plugin for replacing import and export paths

[![npm](https://img.shields.io/npm/v/babel-plugin-module-replace.svg)](https://npmjs.com/package/babel-plugin-module-replace)
[![node](https://img.shields.io/node/v/babel-plugin-module-replace.svg)](https://nodejs.org)

[![size](https://packagephobia.now.sh/badge?p=babel-plugin-module-replace)](https://packagephobia.now.sh/result?p=babel-plugin-module-replace)
[![downloads](https://img.shields.io/npm/dm/babel-plugin-module-replace.svg)](https://npmcharts.com/compare/babel-plugin-module-replace?minimal=true)

[![Build Status](https://github.com/AlexanderOMara/babel-plugin-module-replace/workflows/main/badge.svg)](https://github.com/AlexanderOMara/babel-plugin-module-replace/actions?query=workflow%3Amain+branch%3Amain)

# Overview

Replace ESM import and export paths by regex or function.

Since it replaces the paths before the modules are transpiled, it can also be used to replace the paths for other transpiled module loaders.

Must be configured to change anything, it will not do anything by default.

# Usage

## Option: `replace`

### Regular expression string pair

```json
{
	"plugins": [
		[
			"module-replace",
			{
				"replace": [
					["/^alpha$/", "$1-new"],
					["/^beta$/", "$1-new"]
				]
			}
		]
	]
}
```

### Regular expression object pair (requires JS config file)

```js
export default {
	plugins: [
		[
			'module-replace',
			{
				replace: [[/^(\.\.?\/.+)\.(m|c)tsx?$/i, '$1.js']]
			}
		]
	]
};
```

### Replace function (requires JS config file)

```js
export default {
	plugins: [
		[
			'module-replace',
			{
				replace: [m => m.toLowerCase()]
			}
		]
	]
};
```

# Bugs

If you find a bug or have compatibility issues, please open a ticket under issues section for this repository.

# License

Copyright (c) 2024 Alexander O'Mara

Licensed under the Mozilla Public License, v. 2.0.

If this license does not work for you, feel free to contact me.
