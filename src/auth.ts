import { TwitterApi } from "twitter-api-v2";
class Twitter {
	private static instance: Twitter;
	static api: TwitterApi;

	// biome-ignore lint/complexity/noUselessConstructor: <singleton>
	constructor() {}

	static async init() {
		if (Twitter.instance) {
			return Twitter.api;
		}

		try {
			Twitter.api = new TwitterApi({
				appKey: process.env.CONSUMER_KEY,
				appSecret: process.env.CONSUMER_SECRET,
				accessToken: process.env.ACCESS_TOKEN,
				accessSecret: process.env.ACCESS_TOKEN_SECRET,
			});
			Twitter.instance = new Twitter();
			return Twitter.api;
		} catch (e) {
			throw new Error(`twitter-api-v2 Auth Failure.  ${e}`);
		}
	}
}
const X = await Twitter.init();

export default X;
