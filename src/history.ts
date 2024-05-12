import fsp from "node:fs/promises";

async function updateHistory(id: string, mediaId: string, imgPath: string) {
	const createdAt = new Date().toISOString();
	const body = `${createdAt}\t${id}\t${mediaId}\t${imgPath}\r\n`;
	try {
		await fsp.appendFile(process.env.HISTORY_FILE_PATH, body, { encoding: "utf8" });
	} catch (e) {
		throw new Error(`updateHistory failed due to ${e}`);
	}

	return true;
}
export default updateHistory;
