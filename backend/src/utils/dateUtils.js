/**
 * @param {Date} date
 * @returns {string}
 */
function convertToLocalTimezone(date) {
	const timezoneOffset = new Date().getTimezoneOffset();
	const localDate = new Date(date.getTime() - timezoneOffset * 60000);

	return localDate.toISOString().substring(0, 10);
}

module.exports = {
	convertToLocalTimezone
};
