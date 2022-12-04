const nodemailer = require("nodemailer")

const mailhelper = async (options) => {

    try {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const message = {
            from: 'admin@myshop.com', // sender address
            to: options.toEmail, // list of receivers
            subject: options.subject, // Subject line
            text: options.text, // plain text body
        }
        // send mail with defined transport object
        await transporter.sendMail(message);
    } catch (error) {
        console.log(`Nodemailer:`, error);
    }

}

module.exports = mailhelper