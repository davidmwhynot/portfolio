// import
const mongoose = require('mongoose');
const mailer = require('@sendgrid/mail');
const { escape, isEmail, normalizeEmail } = require('validator');
// const { inspect } = require('util');

// config
const Schema = mongoose.Schema;
const uri = `mongodb+srv://${
	process.env.PORTFOLIO_DB_LOGIN
}.mongodb.net/test?retryWrites=true&w=majority`;
// const SENDGRID_CONFIG = {
// 	auth: {
// 		api_user: process.env.PORTFOLIO_SENDGRID_USER,
// 		api_key: process.env.PORTFOLIO_SENDGRID_KEY
// 	}
// };
mailer.setApiKey(process.env.PORTFOLIO_SENDGRID_KEY);

// connect
mongoose.connect(uri, { useNewUrlParser: true });
// const mailer = nodemailer.createTransport(sendgrid(SENDGRID_CONFIG));

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
		lowercase: true
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
		console.log('req');
		console.log(req);

		if (!(req.subject === 'placeholder')) {
			throw new Error('Invalid honeypot.');
		}

		const message = new Message();

		const checkEmail = isEmail(req.email);

		if (checkEmail) {
			message.email = normalizeEmail(req.email);
		} else {
			throw new Error('Invalid email address.');
		}

		message.name = escape(req.name);
		message.message = escape(req.message);

		console.log('saving message... message: ', message);
		const savedMessage = await message.save();
		console.log('message saved! savedMessage:', savedMessage);

		const mail = {
			from: 'noreply@davidwhynot.me',
			to: 'davidmwhynot@gmail.com',
			subject: 'Portfolio Contact Form Submission',
			html: `<h1>Portfolio Contact Form Submission</h1>
<h3><b>Name:</b> ${message.name}</h3>
<h3><b>Email:</b> ${message.email}</h3>
<h3><b>Message:</b></h3>
<p>${message.message}</p>
<br /><br />
<h3><b>savedMessage:</b></h3>
<p>${JSON.stringify(savedMessage, null, 4)}</p>`
		};

		try {
			console.log('sending email... email:', mail);
			const mailInfo = await mailer.send(mail);

			if (!(mailInfo[0].statusMessage === 'Accepted')) {
				console.warn(
					'problem sending contact form notification email... non-critical'
				);
				console.log('mail:', mail);
				console.log('mailInfo:', mailInfo);
				console.log('\n\n');
			} else {
				console.log('email sent! mailInfo:', mailInfo);
			}
		} catch (err) {
			console.error(err);
			if (err.response && err.response.body && err.response.body.errors) {
				console.log('err.body.errors');
				console.log(JSON.stringify(err.response.body.errors));
				console.log();
			}
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
