const moment = require("moment-timezone");

function generateReminderHtml(reminder) {
    let dueDateText = "";
    if (reminder.today) {
        dueDateText = "today";
    } else {
        const currentMoment = moment().startOf("day");
        const dueMoment = moment(reminder.date);

        // Calculate the difference in days
        const dayDifference = dueMoment.diff(currentMoment, "days");

        dueDateText =
            dayDifference === 1 ? "tomorrow" : `in ${dayDifference} days`;
    }

    return `
    <center class="wrapper" style="${
        ReminderStyles.global + ReminderStyles.wrapper
    }">
        <table class="main" style="${
            ReminderStyles.global + ReminderStyles.table + ReminderStyles.main
        }">
            <tbody>
                <tr style="${ReminderStyles.global}">
                    <td class="td-title" style="${
                        ReminderStyles.global +
                        ReminderStyles.td +
                        ReminderStyles.td_title
                    }">
                        <center style="${ReminderStyles.global}">
                            <h1 class="title" style="${
                                ReminderStyles.global + ReminderStyles.title
                            }">HS-TMS Reminder</h1>
                        </center>
                    </td>
                </tr>
                <tr style="${ReminderStyles.global}">
                    <td style="${ReminderStyles.global + ReminderStyles.td}">
                        <p style="${
                            ReminderStyles.global + ReminderStyles.p
                        }">You are receiving this e-mail because the following
                        reminder is due <b>${dueDateText}</b>:</p>
                    </td>
                </tr>
                <tr style="${ReminderStyles.global}">
                    <td style="${ReminderStyles.global + ReminderStyles.td}">
                        <table class="reminder-table" style="${
                            ReminderStyles.global +
                            ReminderStyles.table +
                            ReminderStyles.reminder_table
                        }">
                            <tbody>
                                <tr class="date-row" style="${
                                    ReminderStyles.global +
                                    ReminderStyles.date_row
                                }">
                                    <td class="reminder-date-flag" style="${
                                        ReminderStyles.global +
                                        ReminderStyles.td +
                                        ReminderStyles.reminder_date_flag
                                    }">
                                        ${reminder.date}
                                    </td>
                                </tr>
                                <tr class="reminder-title-row" style="${
                                    ReminderStyles.global +
                                    ReminderStyles.reminder_title_row
                                }">
                                    <td style="${
                                        ReminderStyles.global +
                                        ReminderStyles.td
                                    }">
                                        <h2 class="reminder-title" style="${
                                            ReminderStyles.global +
                                            ReminderStyles.reminder_title
                                        }">
                                            ${reminder.title}
                                        </h2>
                                    </td>
                                </tr>
                                ${
                                    reminder.description
                                        ? `
                                    <tr style="${ReminderStyles.global}">
                                        <td class="reminder-desc" style="${
                                            ReminderStyles.global +
                                            ReminderStyles.td +
                                            ReminderStyles.reminder_desc
                                        }">
                                            <p style="${
                                                ReminderStyles.global +
                                                ReminderStyles.p
                                            }">${reminder.description}</p>
                                        </td>
                                    </tr>
                                    `
                                        : ""
                                }
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </center>
    `;
}

function generateSummaryHtml(logs) {
    // TODO: week date range
    // TODO: logs ordered by timestamp?

    const filteredLogs = logs.map(log => log.message).map((log) => {
        if (log.resource === "Project") {
            if (log.before) {
                delete log.before.transaction_count;
                delete log.before.balance;
            }
            if (log.after) {
                delete log.after.transaction_count;
                delete log.after.balance;
            }
        } else if (log.resource === "Reminder") {
            if (log.before) delete log.before.notified;
            if (log.after) delete log.after.notified;
        }
        return log;
    });

    const methodsCount = filteredLogs
        .map((data) => data.method)
        .map((method) => {
            if (method === "PUT") return "Modified";
            if (method === "POST") return "New";
            return "Deleted";
        })
        .reduce(
            (a, b) => {
                a[b] += 1;
                return a;
            },
            { New: 0, Deleted: 0, Modified: 0 }
        );

    function changesTable(log) {
        const before = log.before;
        const after = log.after;

        let tbodyHtml = [];
        for (const field of Object.keys(log.before ?? log.after)) {
            let rowHtml = [
                `<td style="${
                    SummaryStyles.global +
                    SummaryStyles.td +
                    SummaryStyles.changes_table__td
                }">${field}:</td>`,
            ];
            const bfValue = before !== null ? before[field] : null;
            const aftValue = after !== null ? after[field] : null;

            if (before === null) {
                rowHtml.push(
                    `<td
                        style="${
                            SummaryStyles.global +
                            SummaryStyles.td +
                            SummaryStyles.changes_table__td
                        }"
                    >
                        <span
                            class="diff green"
                            style="${
                                SummaryStyles.global + SummaryStyles.diff.green
                            }"
                        >
                            ${
                                aftValue === "" || aftValue == null
                                    ? `<i>empty</i>`
                                    : aftValue
                            }
                        </span>
                    </td>`
                );
            } else if (after === null) {
                rowHtml.push(
                    `<td
                        style="${
                            SummaryStyles.global +
                            SummaryStyles.td +
                            SummaryStyles.changes_table__td
                        }"
                    >
                        <span
                            class="diff red"
                            style="${
                                SummaryStyles.global + SummaryStyles.diff.red
                            }"
                        >
                            ${
                                bfValue === "" || bfValue == null
                                    ? `<i>empty</i>`
                                    : bfValue
                            }
                        </span>
                    </td>`
                );
            } else {
                let bfColor, aftColor;
                if (bfValue !== aftValue) {
                    if (aftValue === null) {
                        bfColor = "red";
                    } else if (bfValue === null) {
                        aftColor = "green";
                    } else {
                        bfColor = "red";
                        aftColor = "green";
                    }
                }

                rowHtml.push(
                    `<td
                        style="${
                            SummaryStyles.global +
                            SummaryStyles.td +
                            SummaryStyles.changes_table__td
                        }"
                    >
                        <span
                            class=${`diff ${bfColor ?? ""}`}
                            style="${
                                SummaryStyles.global +
                                (SummaryStyles.diff[bfColor] ?? "")
                            }"
                        >
                            ${
                                bfValue === "" || bfValue == null
                                    ? `<i>empty</i>`
                                    : bfValue
                            }
                        </span>
                    </td>`
                );
                rowHtml.push(
                    `<td
                        style="${
                            SummaryStyles.global +
                            SummaryStyles.td +
                            SummaryStyles.changes_table__td
                        }"
                    >
                        <span
                            class=${`diff ${aftColor ?? ""}`}
                            style="${
                                SummaryStyles.global +
                                (SummaryStyles.diff[aftColor] ?? "")
                            }"
                        >
                            ${
                                aftValue === "" || aftValue == null
                                    ? `<i>empty</i>`
                                    : aftValue
                            }
                        </span>
                    </td>`
                );
            }

            tbodyHtml.push(
                `<tr style="${SummaryStyles.global}">
                    ${rowHtml.join("")}
                </tr>`
            );
        }

        return tbodyHtml.join("");
    }

    return `
        <center
            class="wrapper"
            style="${SummaryStyles.global + SummaryStyles.wrapper}"
        >
            <table
                class="main"
                style="${
                    SummaryStyles.global +
                    SummaryStyles.table +
                    SummaryStyles.main
                }"
            >
                <tbody style="${SummaryStyles.global}">
                    <tr style="${SummaryStyles.global}">
                        <td
                            class="title"
                            style="${
                                SummaryStyles.global +
                                SummaryStyles.td +
                                SummaryStyles.title
                            }"
                        >
                            <center>
                                <h1
                                    style="${
                                        SummaryStyles.global +
                                        SummaryStyles.title__h1
                                    }"
                                >
                                    HS-TMS Weekly Summary
                                </h1>
                                <h4
                                    style="${
                                        SummaryStyles.global +
                                        SummaryStyles.title__h4
                                    }"
                                >
                                    Jan 1 - Jan 7, 2024
                                </h4>
                            </center>
                        </td>
                    </tr>
                    <tr style="${SummaryStyles.global}">
                        <td
                            class="statistics"
                            style="${
                                SummaryStyles.global +
                                SummaryStyles.td +
                                SummaryStyles.statistics
                            }"
                        >
                            ${`This week, ${filteredLogs.length} change${
                                filteredLogs.length > 1 ? "s" : ""
                            } to the database resources
                                ${
                                    filteredLogs.length > 1 ? "were" : "was"
                                } recorded:`}
                            <ul
                                style="${
                                    SummaryStyles.global + SummaryStyles.ul
                                }"
                            >
                                ${Object.entries(methodsCount).map((entry) =>
                                    entry[1] > 0
                                        ? `<li
                                            style="${
                                                SummaryStyles.global +
                                                SummaryStyles.statistics__li
                                            }"
                                        >
                                            ${entry[0]}: ${entry[1]}
                                        </li>`
                                        : ""
                                ).join("")}
                            </ul>
                        </td>
                    </tr>
                    <tr style="${SummaryStyles.global}">
                        <td
                            style="${SummaryStyles.global + SummaryStyles.td}"
                        >
                            <table
                                class="logs-table"
                                style="${
                                    SummaryStyles.global +
                                    SummaryStyles.table +
                                    SummaryStyles.logs_table
                                }"
                            >
                                <thead style="${SummaryStyles.global}">
                                    <tr style="${SummaryStyles.global}">
                                        <th
                                            style="${
                                                SummaryStyles.global +
                                                SummaryStyles.logs_table__th +
                                                SummaryStyles.log_border_r
                                            }"
                                        >
                                            Author
                                        </th>
                                        <th
                                            style="${
                                                SummaryStyles.global +
                                                SummaryStyles.logs_table__th +
                                                SummaryStyles.log_border_r
                                            }"
                                        >
                                            Resource
                                        </th>
                                        <th
                                            style="${
                                                SummaryStyles.global +
                                                SummaryStyles.logs_table__th +
                                                SummaryStyles.log_border_r
                                            }"
                                        >
                                            Action
                                        </th>
                                        <th
                                            style="${
                                                SummaryStyles.global +
                                                SummaryStyles.logs_table__th
                                            }"
                                        >
                                            Changes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody style="${SummaryStyles.global}">
                                    ${filteredLogs.map(
                                        (log, idx, arr) =>
                                            `<tr
                                            class="log-row"
                                            style="${SummaryStyles.global}"
                                        >
                                            <td
                                                style="${
                                                    SummaryStyles.global +
                                                    SummaryStyles.td +
                                                    SummaryStyles.logs_table_td +
                                                    SummaryStyles.log_border_r +
                                                    (idx < arr.length - 1
                                                        ? SummaryStyles.log_border_b
                                                        : "")
                                                }"
                                            >
                                                ${log.author}
                                            </td>
                                            <td
                                                style="${
                                                    SummaryStyles.global +
                                                    SummaryStyles.td +
                                                    SummaryStyles.logs_table_td +
                                                    SummaryStyles.log_border_r +
                                                    (idx < arr.length - 1
                                                        ? SummaryStyles.log_border_b
                                                        : "")
                                                }"
                                            >
                                                ${log.resource}
                                            </td>
                                            <td
                                                style="${
                                                    SummaryStyles.global +
                                                    SummaryStyles.td +
                                                    SummaryStyles.logs_table_td +
                                                    SummaryStyles.log_border_r +
                                                    (idx < arr.length - 1
                                                        ? SummaryStyles.log_border_b
                                                        : "")
                                                }"
                                            >
                                                ${
                                                    log.method === "POST"
                                                        ? "Create"
                                                        : log.method === "PUT"
                                                        ? "Edit"
                                                        : "Delete"
                                                }
                                            </td>
                                            <td
                                                class="changes-td"
                                                style="${
                                                    SummaryStyles.global +
                                                    SummaryStyles.td +
                                                    SummaryStyles.logs_table_td +
                                                    SummaryStyles.changes_td +
                                                    (idx < arr.length - 1
                                                        ? SummaryStyles.log_border_b
                                                        : "")
                                                }"
                                            >
                                                <table
                                                    class="changes-table"
                                                    style="${
                                                        SummaryStyles.global +
                                                        SummaryStyles.table +
                                                        SummaryStyles.changes_table
                                                    }"
                                                >
                                                    <tbody
                                                        style="${
                                                            SummaryStyles.global
                                                        }"
                                                    >
                                                        ${changesTable(log)}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>`
                                    ).join("")}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </center>
    `;
}

class ReminderStyles {
    /* the usual "*" reset */
    static global = `
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif;
        line-height: normal;
    `;
    static table = `
        border-spacing: 0;
        border-collapse: separate;
    `;
    static td = `
        word-wrap: break-word;
    `;
    static p = `
        font-size: 16px;
    `;

    /* classnames */
    static wrapper = `
        width: 100%;
        table-layout: fixed;
        background-color: #2C2C2C;
    `;
    static main = `
        background-color: #212121;
        table-layout: fixed;
        color: white;
        width: auto;
        max-width: 650px;
        margin: 0 auto;
        padding: 0px 25px 60px;
    `;

    static td_title = `
        padding-top: 40px;
        padding-bottom: 30px;
    `;

    static title = `
        color: #6BBA75;
        font-size: 32px;
        font-weight: 700;
    `;

    static reminder_table = `
        margin: 20px auto 0;
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 1rem;
        padding: 15px 15px 5px;
    `;

    static date_row = `
        display: inline-block;
    `;

    static reminder_title_row = `
        display: inline-block;
    `;

    static reminder_date_flag = `
        display: inline-block;
        width: fit-content;
        font-size: 16px;
        text-align: center;
        font-weight: 700;
        color: white;
        background-color: #0E9553;
        border: 1px solid #333333;
        border-radius: 6.25rem;
        padding: 7px 14px;
        margin-bottom: 10px;
        margin-right: 10px;
    `;

    static reminder_title = `
        display: inline-block;
        margin-bottom: 10px;
        font-size: 24px;
        font-weight: 700;
    `;

    static reminder_desc = `
        padding-bottom: 10px;
        font-size: 16px;
    `;
}

class SummaryStyles {
    /* the usual "*" reset */
    static global = `
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif;
        line-height: normal;
    `;

    static a = `
        text-decoration: none;
        color: inherit;
    `;

    static table = `
        border-spacing: 0;
        border-collapse: separate;
    `;

    static td = `
        word-wrap: break-word;
    `;

    static ul = `
        padding-left: 40px;
    `;

    /* classnames */
    static wrapper = `
        width: 100%;
        table-layout: fixed;
        background-color: #2C2C2C;
    `;

    static main = `
        background-color: #212121;
        table-layout: fixed;
        color: white;
        width: auto;
        max-width: 100%;
        margin: 0 auto;
        padding: 0px 25px 60px;
    `;

    static title = `
        padding-top: 40px;
        padding-bottom: 30px;
    `;

    static title__h1 = `
        color: #6BBA75;
        font-size: 32px;
        font-weight: 700;
    `;

    static title__h4 = `
        color: #aeaeae;
        font-style: italic;
        font-size: 16px;
        font-weight: 500;
        margin-top: 3px;
    `;

    static statistics = `
        font-size: 15px;
        line-height: 1.5;
    `;

    static statistics__li = `
        line-height: 1.5;
    `;

    static logs_table = `
        margin: 30px 0px 0px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 16px;
    `;

    static logs_table__th = `
        color: #0E9553;
        font-size: 18px;
        text-align: center;
        padding: 7px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    `;

    static log_border_r = `
        border-right: 1px dashed rgba(255, 255, 255, 0.1);
    `;

    static log_border_b = `
        border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    `;

    static logs_table_td = `
        font-size: 14px;
        text-align: center;
        padding: 15px 15px 15px;
    `;

    static changes_td = `
        padding-left: 5px;
        padding-right: 5px;
        max-width: 400px;
    `;

    static changes_table = `
        max-width: 100%;
        margin: 0 auto 0 0;
    `;

    static changes_table__td = `
        border: none;
        padding: 5px 10px 0px;
        font-size: 13px;
        text-align: left;
        vertical-align: top;
        line-height: 1.3;
    `;

    static diff = {
        green: `color: #50e882;`,
        red: `color: #FF6E67;`,
    };
}

module.exports = {
    generateReminderHtml,
    generateSummaryHtml,
};
