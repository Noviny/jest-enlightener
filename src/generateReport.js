const generateReport = (toRevert, { totalUpdatedTests }) => {
	const revertedChangeCount = Object.keys(toRevert).length;
	const changedCount = totalUpdatedTests - revertedChangeCount;
	if (changedCount === 0)
		return `\nwe couldn't enlighten any of the ${totalUpdatedTests} tests we tried to update.`;
	return `\n ${changedCount}/${totalUpdatedTests} possible tests were enlightened. Have a look at your uncommitted git changes to verify, then commit away!`;
};

module.exports = generateReport;
