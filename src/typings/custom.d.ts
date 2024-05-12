export type {};
declare global {
	type baseObj = {
		createdAt: string; //YYYY-MM-DD HH:MM:SS
		appName: string;
		eventname: string;
		level: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG";
		messsage: string;
	};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	type logObj = baseObj & Record<string, any>;

	type mailObj = {
		[key in "to" | "from" | "subject" | "text"]: string;
	};

	type createPostRes = {
		id: string;
		mediaId: string;
		imgFilePath: string;
	};
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production" | "local";
			[key: string]: string;
		}
	}
}
