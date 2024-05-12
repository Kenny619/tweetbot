import updateHistory from "./history.js";
import * as img from "./imageHandler.js";
import Log from "./logger.js";
import sendMail from "./mailer.js";
import createPost from "./post.js";
import ExpoBackoffRetry from "./retry.js";
const intervalInMS = Number(process.env.POST_INTERVAL_MM) * 60 * 1000;
await new Promise((resolve, reject) => {
    try {
        resolve(main());
    }
    catch (e) {
        reject(console.log(`${e}`));
    }
});
new Promise((resolve, reject) => {
    setInterval(async () => {
        try {
            resolve(await main());
        }
        catch (e) {
            reject(console.log(e));
        }
    }, intervalInMS);
});
async function main() {
    let res = {};
    try {
        res = await ExpoBackoffRetry(Number(process.env.RETRY_COUNT), Number(process.env.RETRY_WAIT_MS), createPost);
        Log.info("uploadPost", `Post uploaded successfully with id:${res.id}`);
        const uploadedPath = await img.moveImage(res.imgFilePath, process.env.IMG_UPLOADED_DIR_PATH);
        await updateHistory(res.id, res.mediaId, uploadedPath);
    }
    catch (e) {
        if (!res) {
            Log.fatal("uploadPost", `upload failed ${process.env.RETRY_COUNT}times.  ${e}`);
            sendMail.postFialed();
            throw new Error(`${e}`);
        }
        Log.error("washup", `Wash up tasks after the uploadPost failed.  ${e}`);
        throw new Error(`${e}`);
    }
}
