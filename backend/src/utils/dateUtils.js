/**
 * @param {Date} date
 * @returns {string}
 */
function dateToString(date) {
  return date.toISOString().substring(0, 10);
}

/**
 * @param {Date} dateString
 * @returns {boolean}
 */
function isValidDate(dateString, isMonth = false) {
  try {
    const parsedDate = new Date(dateString);
    // Check if the parsed date is a valid date
    if (isNaN(parsedDate.getTime())) return false; // Invalid date

    // Check if the parsed day matches the original input day since the Date
    // class normalizes dates, i.e.: turns '2000-06-31' to '2000-07-01'

    // If the date was just a month (YYYY-MM), there's no problem
    if (isMonth) return true;

    const dateParts = dateString.split("-");
    const day = parseInt(dateParts[2]);
    if (day !== parsedDate.getDate()) return false; // Invalid date (day mismatch)

    return true; // Valid date
  } catch (error) {
    return false; // An error occurred during parsing, so it's not a valid date
  }
}

module.exports = {
  dateToString,
  isValidDate,
};
