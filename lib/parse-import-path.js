const { parse } = require('url');
const parseCommittish = require('../lib/parse-committish');

module.exports = function parseImportPath(url) {
	const { pathname } = parse(url);
	const params = {};
	const parts = pathname.substring(1).split('/');
	const numParts = parts.length;

	if (numParts === 1) {
		if (parts[0]) params.repo = parts[0];
	} else if (numParts >= 2) {
		if (parts[0]) params.org = parts[0];
		if (parts[1]) params.repo = parts[1];
	}
	if (!params.file && numParts > 2) {
		params.file = decodeURI(parts.slice(2).join('/'));
	}
	parseCommittish(params);
	return params;
};

//const assert = require('assert');
//assert.deepEqual(module.exports('/'), {});
//assert.deepEqual(module.exports('/foo'), { repo: 'foo' });
//assert.deepEqual(module.exports('/foo/bar'), { org: 'foo', repo: 'bar' });
//assert.deepEqual(module.exports('/foo/bar/baz'), { org: 'foo', repo: 'bar', file: 'baz' });
//assert.deepEqual(module.exports('/foo@1.0.0'), { repo: 'foo', committish: '1.0.0' });
//assert.deepEqual(module.exports('/foo/bar@1.0.0'), { org: 'foo', repo: 'bar', committish: '1.0.0' });
//assert.deepEqual(module.exports('/foo/bar/baz@1.0.0'), { org: 'foo', repo: 'bar', file: 'baz', committish: '1.0.0' });
