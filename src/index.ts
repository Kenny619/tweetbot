import updateHistory from "@/history.js";
import * as img from "@/imageHandler.js";
import Log from "@/logger.js";
import sendMail from "@/mailer.js";
import createPost from "@/post.js";
import ExpoBackoffRetry from "@/retry.js";

//loop
const intervalInMS = Number(process.env.POST_INTERVAL_MM) * 60 * 1000; // minutes * 60sec/1min * 1000ms/1sec

//Initial run
await new Promise((resolve, reject) => {
  try {
    resolve(main());
  } catch (e) {
    reject(console.log(`${e}`));
  }
});

//Loop
new Promise((resolve, reject) => {
  setInterval(async () => {
    try {
      resolve(await main());
    } catch (e) {
      reject(console.log(e));
    }
  }, intervalInMS);
});



async function main(): Promise<void> {
  let res: Partial<createPostRes> = {};
  try {
    res = await ExpoBackoffRetry(Number(process.env.RETRY_COUNT), Number(process.env.RETRY_WAIT_MS), createPost);
    Log.info("uploadPost", `Post uploaded successfully with id:${res.id}`);

    //move image to uploaded directory
    const uploadedPath = await img.moveImage(res.imgFilePath as string, process.env.IMG_UPLOADED_DIR_PATH);

    //log the result to history.txt
    await updateHistory(res.id as string, res.mediaId as string, uploadedPath);
  } catch (e) {
    if (!res) {
      Log.fatal("uploadPost", `upload failed ${process.env.RETRY_COUNT}times.  ${e}`);
      sendMail.postFialed();
      throw new Error(`${e}`);
    }
    Log.error("washup", `Wash up tasks after the uploadPost failed.  ${e}`);
    throw new Error(`${e}`);
  }
}
