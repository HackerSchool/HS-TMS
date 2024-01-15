const { Resend } = require("resend");
const { generateReminderHtml, generateSummaryHtml } = require("./templates");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @param {Array<string>} recipients
 * @param {Array<object>} logs
 */
async function sendWeeklySummaryEmail(recipients, logs) {
	if (!logs || logs.length === 0) {
		return;
	}

	try {
		await resend.emails.send({
			from: "HackerSchool <no-reply@hackerschool.io>",
			to: recipients,
			subject: "[HS-TMS] Weekly Summary",
			html: generateSummaryHtml(logs)
		});
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
