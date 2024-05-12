import fsp from "node:fs/promises";
import path from "node:path";
import X from "./auth.js";
import Log from "./logger.js";
import sendMail from "./mailer.js";
async function getMediaId(imagePath) {
    try {
        (await fsp.stat(imagePath)).isFile();
        const mediaId = await X.v1.uploadMedia(imagePath);
        return mediaId;
    }
    catch (e) {
        throw new Error(`getMediaId failed. ${e}`);
    }
}
async function selectImageFromRepo(imageDir) {
    try {
        const stat = await fsp.stat(imageDir);
        stat.isDirectory();
    }
    catch (e) {
        throw new Error(`selectImage failed.  ${imageDir} is not a valid directory.  ${e}`);
    }
    const Dirent = await fsp.readdir(imageDir, { recursive: true, withFileTypes: true });
    const imgPaths = Dirent.filter((d) => d.isFile() && /jpg$|jpeg$|png$/.test(path.extname(d.name))).map((d) => path.join(d.path, d.name));
    if (imgPaths.length === 0) {
        sendMail.noImages();
        Log.warn("selectImage", `There's no images found in ${imageDir}. `);
        throw new Error(`SelectImageFromRepo failed.  There's no image in ${imageDir}.`);
    }
    if (imgPaths.length < Number(process.env.IMG_COUNT_TH)) {
        sendMail.belowTh();
        Log.warn("selectImage", `${imgPaths.length} images found in ${imageDir}. Below threshold of ${Number(process.env.IMG_COUNT_TH)}`);
    }
    return imgPaths.shift();
}
async function moveImage(imageFilePath, uploadedDir) {
    try {
        (await fsp.stat(uploadedDir)).isDirectory();
        const tempFilePath = `${uploadedDir}/.writable_test`;
        await fsp.writeFile(tempFilePath, "");
        await fsp.unlink(tempFilePath);
    }
    catch (e) {
        throw new Error(`Invalid uploadedDir ${uploadedDir} ${e}`);
    }
    try {
        (await fsp.stat(imageFilePath)).isFile();
    }
    catch (e) {
        throw new Error(`Invalid image file ${imageFilePath} ${e}`);
    }
    try {
        const dstFilePath = `${uploadedDir}/${path.basename(imageFilePath)}`;
        await fsp.copyFile(imageFilePath, dstFilePath);
        await fsp.unlink(imageFilePath);
        return dstFilePath;
    }
    catch (e) {
        throw new Error(`File copy failed on ${imageFilePath} ${e}`);
    }
}
export { getMediaId, selectImageFromRepo, moveImage };
