function parse(query, prop) {
	const val = query[prop];
	if (!val) return;
	const at = val.lastIndexOf('@');
	if (at !== -1) {
		query.committish = val.substring(at + 1);
		query[prop] = val.substring(0, at);
	}
}

module.exports = function parseCommittish(query) {
	parse(query, 'repo');
	parse(query, 'file');
	return query;
};
