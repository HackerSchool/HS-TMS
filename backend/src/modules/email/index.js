const { Resend } = require("resend");
const moment = require("moment-timezone")
const { generateReminderHtml, generateSummaryHtml } = require("./templates");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @param {Array<string>} recipients
 * @param {Array<object>} logs
 */
async function sendWeeklySummaryEmail(recipients, logs) {
	if (!logs || logs.length === 0) {
		return;
	}
    const weeksMap = new Map();
    for (const log of logs) {
        const logDate = log.timestamp.substr(0, 10); // YYYY-MM-DD
        const isoWeek = moment(logDate, "YYYY-MM-DD").format("YYYY-WW");
        if (!weeksMap.has(isoWeek)) {
            weeksMap.set(isoWeek, []);
        }
        weeksMap.get(isoWeek).push(log);
    }

	try {
        for (const isoWeek of weeksMap.keys()) {
            const firstDay = moment(isoWeek, "YYYY-WW").startOf('isoWeek');
            const lastDay = moment(isoWeek, "YYYY-WW").endOf('isoWeek');

            const rangeString =
                firstDay.year() === lastDay.year()
                    ? `${firstDay.format("MMM D")} - ${lastDay.format(
                          "MMM D"
                      )}, ${firstDay.year()}`
                    : `${firstDay.format("MMM D YYYY")} - ${lastDay.format(
                          "MMM D YYYY"
                      )}`;

            await resend.emails.send({
                from: "HackerSchool <no-reply@hackerschool.io>",
                to: recipients,
                subject: "[HS-TMS] Weekly Summary",
                html: generateSummaryHtml(weeksMap.get(isoWeek), rangeString)
            });
        }
	} catch (error) {}
}

/**
 * @param {Array<string>} recipients
 * @param {object} reminder
 * @returns {boolean}
 */
async function sendReminderEmail(recipients, reminder) {
	if (!reminder) {
		return false;
	}

	try {
		await resend.emails.send({
			from: "HackerSchool <no-reply@hackerschool.io>",
			to: recipients,
			subject: `[HS-TMS] Reminder: ${reminder.title}`,
			html: generateReminderHtml(reminder)
		});
	} catch (error) {
		return false;
	}

	return true;
}

module.exports = { sendWeeklySummaryEmail, sendReminderEmail };
