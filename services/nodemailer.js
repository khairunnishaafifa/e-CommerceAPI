const nodemailer = require('nodemailer')
    , nodemailerSendgrid = require('nodemailer-sendgrid')

const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
)

exports.sendVerification = async (email, data, res) => {
    transport.sendMail({
        from: '"Todo Apps Support" <noreply-support@todoapps.com>',
        to: email,
        subject: data.subject,
        html: `<h3>Hi ${data.username}!</h3>
            <p>Please verify your account by click the link below:\n</p>
            <a href="https://app-todoapps.herokuapp.com/users/reset/${data.token}" target="_blank">Reset Password</a>`
    })
        .then(() => res.json({
            message: `Email sent to ${email}`,
            token: data.token
        }))
}