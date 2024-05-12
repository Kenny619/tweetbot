import Log from "@/logger.js";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type retryFunction<R> = (...args: any[]) => Promise<R>;
async function ExpoBackoffRetry<R>(
	retryCount: number,
	waitMS: number,
	fn: retryFunction<R>,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	fnArgs: any[] = [],
): Promise<R> {
	//initialize attempt count at 0
	let attempt = 1;

	return await retry();

	async function retry(): Promise<R> {
		try {
			return fnArgs.length > 0 ? await fn(...fnArgs) : await fn();
		} catch (e) {
			//throw error when attempt reaches passed retryCount
			if (attempt === retryCount) {
				return Promise.reject(
					new Error(
						`Retry attempt(${attempt}) reached its cap of ${retryCount}.  Exiting program.  Last attempt failed due to: ${e}`,
					),
				);
			}

			//Extend sleep duration
			const sleep = 2 ** (attempt - 1) * waitMS;

			console.log(`Attempt #${attempt} failed due to ${e}.\r\nRetrying in ${sleep / 1000} seconds`);
			attempt++;

			Log.error("EBretry", `upload attempt #${attempt} failed due to ${e}.  Retry in ${sleep / 1000} seconds...`);
			//Return promise after sleep milli seconds

			return new Promise((resolve, reject) => {
				setTimeout(async () => {
					try {
						resolve(await retry());
					} catch (e) {
						reject(e);
					}
				}, sleep);
			});
		}
	}
}

export default ExpoBackoffRetry;
