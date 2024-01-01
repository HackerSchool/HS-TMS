const { CronJob } = require("cron");
const { weeklyBackup } = require("../utils/fileUtils");

new CronJob(
	"0 4 * * 2", // Every Tuesday at 4 am
	async () => {
		try {
			await weeklyBackup();
		} catch (error) {}
	},
	null,
	true,
	"Europe/Lisbon"
);
