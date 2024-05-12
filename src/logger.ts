import fsp from "node:fs/promises";
import path from "node:path";
/*
LOG format
datetime appName eventName Level Message
*/

class Log {
	private static instance: Log;
	private static filePath: string;
	private static appName: string;
	private constructor() {}

	static async init(appName: string, logFilePath: string) {
		try {
			const stat = await fsp.stat(logFilePath);
			if (!stat.isFile()) {
				const logDir = await fsp.mkdir(path.dirname(logFilePath));
				await fsp.writeFile(logFilePath, "", { encoding: "utf8" });
			}
		} catch (e) {
			throw new Error(`Invalid log file path ${logFilePath} ERROR: ${e}`);
		}

		if (Log.instance) {
			return Log.instance;
		}
		Log.instance = new Log();
		Log.filePath = logFilePath;
		Log.appName = appName;
		return Log.instance;
	}

	static async record(level: baseObj["level"], eventName: string, message: string) {
		const obj: Partial<logObj> = {};
		obj.createdAt = new Date().toISOString();
		obj.appName = Log.appName;
		obj.eventname = eventName;
		obj.level = level;
		obj.messsage = message;
		const log = `${Object.values(obj).join("\t")}\r\n`;
		try {
			await fsp.appendFile(Log.filePath, log);
		} catch (e) {
			throw new Error(`Failed to record application log to ${Log.filePath}. ERROR:${e}`);
		}
	}

	static async debug(eventName: string, message: string) {
		try {
			await Log.record("DEBUG", eventName, message);
		} catch (e) {
			throw new Error(`Log debug failed. ${e}`);
		}
	}

	static async info(eventName: string, message: string) {
		try {
			Log.record("INFO", eventName, message);
		} catch (e) {
			throw new Error(`Log info failed ${e}`);
		}
	}

	static async warn(eventName: string, message: string) {
		try {
			Log.record("WARN", eventName, message);
		} catch (e) {
			throw new Error(`Log warn failed ${e}`);
		}
	}

	static async error(eventName: string, message: string) {
		try {
			Log.record("ERROR", eventName, message);
		} catch (e) {
			throw new Error(`Log error failed ${e}`);
		}
	}

	static fatal(eventName: string, message: string) {
		Log.record("FATAL", eventName, message);
	}
}
await Log.init(process.env.LOG_APP_NAME, process.env.LOG_FILE_PATH);
export default Log;
