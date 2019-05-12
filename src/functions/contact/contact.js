// import
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');

// config
const Schema = mongoose.Schema;
const uri = `mongodb+srv://${
	process.env.PORTFOLIO_DB_LOGIN
}.mongodb.net/test?retryWrites=true`;
const SENDGRID_CONFIG = {
	auth: {
		api_user: process.env.PORTFOLIO_SENDGRID_USER,
		// api_user: 'asdf',
		api_key: process.env.PORTFOLIO_SENDGRID_KEY
	}
};

// connect
mongoose.connect(uri, { useNewUrlParser: true });
const mailer = nodemailer.createTransport(sendgrid(SENDGRID_CONFIG));

// message model
const messageSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		match: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
	},
	message: {
		type: String,
		required: true
	},
	time: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// request handler
exports.handler = async function(event, context) {
	try {
		const req = JSON.parse(event.body);

		const message = new Message();

		message.name = req.name;
		message.email = req.email;
		message.message = req.message;

		const savedMessage = await message.save();

		const mail = {
			from: 'noreply@TODO.com',
			to: 'davidmwhynot@gmail.com',
			subject: 'Portfolio Contact Form Submission',
			html: `
			<h1>Portfolio Contact Form Submission</h1>
			<h3><b>Name:</b> ${message.name}</h3>
			<h3><b>Email:</b> ${message.email}</h3>
			<h3><b>Message:</b></h3>
			<p>${message.message}</p>
			<br /><br />
			<h3><b>savedMessage:</b></h3>
			<p>${JSON.stringify(savedMessage, null, 4)}</p>
			`
		};

		try {
			const mailInfo = await mailer.sendMail(mail);

			if (!(mailInfo.message === 'success')) {
				console.warn(
					'problem sending contact form notification email... non-critical'
				);
				console.log('mail:', mail);
				console.log('mailInfo:', mailInfo);
			}
		} catch (err) {
			console.error(err);
			console.warn(
				'failed to send contact form notification email... non-critical'
			);
			console.log('mail:', mail);
		} finally {
			return { statusCode: 200, body: '' };
		}
	} catch (err) {
		console.error(err);
		return { statusCode: 500, body: '' };
	}
};
