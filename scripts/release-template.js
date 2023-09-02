/*
 * Input:
 * ```
 * const dependenciesReleaseNotesData =
 * {
 *    major: [ change1, change2, ... ],
 *    minor: [ change1, change2, ... ],
 *    patch: [ change1, change2, ... ]
 * }
 * ```
 *
 * Each change:
 * ```
 * {
 *    packageName,
 *    version,
 *    previousRelease,
 *    currentRelease,
 *    previousReleaseSha,
 *    currentReleaseSha,
 *    htmlUrl,
 *    title,
 *    body
 * }
 * ```
 */

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

function formatChange ({packageName, version, htmlUrl, title, body}, priority) {
	return priority === 'patch'
		? `- [${packageName} ${version}${title ? ' - ' + title : ''}](${htmlUrl})`
		: `## [${packageName} ${version}${title ? ' - ' + title : ''}](${htmlUrl})${body ? '\n' + body : ''}`;
}

function formatChanges(changes, priority) {
	const alphabetizedChanges = changes.sort((a, b) => a.packageName > b.packageName ? 1 : -1);
	const notes = alphabetizedChanges.map(change => formatChange(change, priority));
	return notes.join('\n\n');
}

const addDocs = (releaseNotes) => {
	const availableNotes = Object.values(releaseNotes).reduce((acc, arr) => [...acc, ...arr], [] );
	return formatted = availableNotes.reduce((acc, change) => {
			if (change.title.includes('doc') || change.body.includes('doc')) {
					acc['documentation'].push(change);
			} else {
					acc[change.type].push(change);
			}
			return acc;
	}, {major: [], minor: [], patch: [], documentation: []});
};
const priorityTitles = {
	major: 'Breaking changes',
	minor: 'New features',
	patch: 'Bug fixes',
	documentation: 'Documentation',
};

module.exports = releaseNotes => {
	const notesWithDocs = addDocs(releaseNotes);
	const formattedReleaseNotes = Object.entries(notesWithDocs).map(([priority, changes]) => {
		if (!changes.length) {
			return;
		}
		const formattedNotes = formatChanges(changes, priority);
		return `# ${capitalize(priorityTitles[priority])}\n\n${formattedNotes}`;
	}).filter(note => !!note);
	return formattedReleaseNotes.join('\n\n');
};