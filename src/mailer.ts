import Log from "@/logger.js";
import { createTransport } from "nodemailer";
import type SMTPConnection from "nodemailer/lib/smtp-connection/index.js";

const nodemailerOption: SMTPConnection.Options = {
	host: process.env.SMTP_SERVER,
	port: Number(process.env.SMTP_PORT),
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
};

const transporter = createTransport(nodemailerOption);

const belowThOption: mailObj = {
	to: process.env.EMAIL_TO,
	from: process.env.EMAIL_FROM,
	subject: "[WARN] Remaining image count Below Threshold",
	text: `Hi,\r\nThe number of image stock is now below the thresold of ${process.env.IMAGE_COUNT_TH}.\r\nPlease upload new images to the server before it runs out.\r\nThank you!`,
};

const noMoreImages: mailObj = {
	to: process.env.EMAIL_TO,
	from: process.env.EMAIL_FROM,
	subject: "[ACTION REQUIRED] No images in the image repository",
	text: "Hi,\r\ntweetbot stopped running due to the lack of image in the repository.\r\nPlease upload new images to the server and restart the program.\r\nThank you!",
};

const postFialed: mailObj = {
	to: process.env.EMAIL_TO,
	from: process.env.EMAIL_FROM,
	subject: "[ERROR] Post failed",
	text: "Hi,\r\ntweetbot failed to create a post.",
};
const sendMail = {
	belowTh: () => {
		transporter.sendMail(belowThOption, (e, reply) => {
			if (e) Log.error("Email", `Failed to send 'Below Threshold' email.  ${e}`);
			if (reply) Log.info("Email", "Successfully sent 'Below Threshold' email.");
			console.log("belowTh email successfully sent");
		});
	},

	noImages: () => {
		transporter.sendMail(noMoreImages, (e, reply) => {
			if (e) Log.error("Email", `Failed to send 'No images' email. ${e}`);
			if (reply) Log.info("Email", "Successfully sent 'No images' email.");
			console.log("noImages email successfully sent");
		});
	},

	postFialed: () => {
		transporter.sendMail(postFialed, (e, reply) => {
			if (e) Log.error("Email", `Failed to send 'Post failed' email.  ${e}`);
			if (reply) Log.info("Email", "Successfully sent 'No images' email.");
			console.log("postFailed email successfully sent");
		});
	},
};

export default sendMail;
