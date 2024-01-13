function generateReminderHtml(reminder) {
    // TODO: number of days until reminder is due

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
                        <center>
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
                        reminder is due in 7 days:</p>
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

function generateSummaryHtml(logs) {}

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

module.exports = {
    generateReminderHtml,
    generateSummaryHtml,
};
