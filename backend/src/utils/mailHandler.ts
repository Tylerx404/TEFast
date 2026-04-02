var nodemailer = require("nodemailer");

var mailHandler = {
  createTransporter: function () {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER || "",
        pass: process.env.MAIL_PASSWORD || "",
      },
    });
  },

  sendMail: async function (mailOptions) {
    try {
      var transporter = mailHandler.createTransporter();
      var info = await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER || "",
        to: mailOptions.to,
        subject: mailOptions.subject || "TEFast Mail",
        html: mailOptions.html || "",
        text: mailOptions.text || "",
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },

  sendForgotPasswordMail: async function (email, token) {
    var resetLink =
      (process.env.APP_URL || "http://127.0.0.1:3001") +
      "/auth/reset-password?token=" +
      token;

    return await mailHandler.sendMail({
      to: email,
      subject: "Quen mat khau",
      html:
        "<p>Ban vua yeu cau dat lai mat khau.</p>" +
        "<p>Vui long bam vao link sau: <a href='" +
        resetLink +
        "'>" +
        resetLink +
        "</a></p>",
      text: "Dat lai mat khau: " + resetLink,
    });
  },
};

module.exports = mailHandler;
