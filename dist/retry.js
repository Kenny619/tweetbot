import Log from "./logger.js";
async function ExpoBackoffRetry(retryCount, waitMS, fn, fnArgs = []) {
    let attempt = 1;
    return await retry();
    async function retry() {
        try {
            return fnArgs.length > 0 ? await fn(...fnArgs) : await fn();
        }
        catch (e) {
            if (attempt === retryCount) {
                return Promise.reject(new Error(`Retry attempt(${attempt}) reached its cap of ${retryCount}.  Exiting program.  Last attempt failed due to: ${e}`));
            }
            const sleep = 2 ** (attempt - 1) * waitMS;
            console.log(`Attempt #${attempt} failed due to ${e}.\r\nRetrying in ${sleep / 1000} seconds`);
            attempt++;
            Log.error("EBretry", `upload attempt #${attempt} failed due to ${e}.  Retry in ${sleep / 1000} seconds...`);
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        resolve(await retry());
                    }
                    catch (e) {
                        reject(e);
                    }
                }, sleep);
            });
        }
    }
}
export default ExpoBackoffRetry;
