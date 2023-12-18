const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @param {Array<string>} recipients
 * @param {Array<object>} logs
 */
async function sendWeeklySummary(recipients, logs) {
	if (!logs || logs.length === 0) {
		return;
	}

	const tableHeaders = Object.keys(logs[0]);
	const tableRows = logs.map((entry) => Object.values(entry));

	const headerRow = `<tr>${tableHeaders
		.map((header) => `<th>${header}</th>`)
		.join("")}</tr>`;
	const bodyRows = tableRows.map(
		(row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
	);

	const htmlTable = `
    <table border="1">
      <thead>${headerRow}</thead>
      <tbody>${bodyRows.join("")}</tbody>
    </table>
  `;

	try {
		const res = await resend.emails.send({
			from: "HackerSchool <no-reply@hackerschool.io>",
			to: recipients,
			subject: "[HS-TMS] Weekly Summary",
			html: htmlTable
		});

		console.log(res);
	} catch (error) {
		console.error(error);
	}
}

module.exports = { sendWeeklySummary };
