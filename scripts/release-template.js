module.exports = (releaseNotes) => {
	const availableNotes = Object.values(releaseNotes).reduce((acc, arr) => [...acc, ...arr], [] );
	return availableNotes.reduce((acc, change) => {
		if (change.title.includes('doc') || change.body.includes('doc')) {
			acc['documentation'].push(change);	
		} else {
			acc[change.type].push(change);
		}
    	return acc;
	}, {major: [], minor: [], patch: [], documentation: []});
};