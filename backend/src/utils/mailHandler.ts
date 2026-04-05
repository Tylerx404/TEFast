var nodemailer = require("nodemailer");
var cachedTransporter: any = null;
var cachedTransporterKey = "";
var warmupPromise: Promise<any> | null = null;

function readEnv(keys, fallbackValue) {
  for (var index = 0; index < keys.length; index += 1) {
    var value = process.env[keys[index]];

    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return fallbackValue;
}

function readNumberEnv(keys, fallbackValue) {
  var value = readEnv(keys, "");

  if (value === "") {
    return fallbackValue;
  }

  var parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallbackValue;
  }

  return parsedValue;
}

function readBooleanEnv(keys, fallbackValue) {
  var value = readEnv(keys, "");

  if (value === "") {
    return fallbackValue;
  }

  var normalizedValue = String(value).trim().toLowerCase();

  return (
    normalizedValue === "1" ||
    normalizedValue === "true" ||
    normalizedValue === "yes" ||
    normalizedValue === "on"
  );
}

function buildFrontendUrl(path) {
  var frontendUrl = readEnv(
    ["FRONTEND_URL", "WEB_URL", "NEXT_PUBLIC_APP_URL", "APP_URL"],
    "http://localhost:3000",
  ).replace(/\/+$/, "");
  var normalizedPath = path.charAt(0) === "/" ? path : "/" + path;

  return frontendUrl + normalizedPath;
}

var mailHandler = {
  buildVerifyEmailUrl: function (token) {
    return buildFrontendUrl(
      "/verify-email?token=" + encodeURIComponent(token),
    );
  },

  getConfig: function () {
    var port = readNumberEnv(["SMTP_PORT", "MAIL_PORT"], 587);
    var secure = readBooleanEnv(["USE_TLS_SSL", "Use_TLS_SSL", "MAIL_SECURE"], port === 465);

    return {
      host: readEnv(["SMTP_HOST", "MAIL_HOST"], "smtp.gmail.com"),
      port: port,
      secure: secure,
      user: readEnv(["SMTP_USERNAME", "MAIL_USER"], ""),
      pass: readEnv(["SMTP_PASS", "MAIL_PASSWORD"], ""),
      from: readEnv(
        ["FROM_EMAIL", "MAIL_FROM", "SMTP_FROM", "SMTP_USERNAME", "MAIL_USER"],
        "",
      ),
    };
  },

  getConfigKey: function (config) {
    return [
      config.host,
      String(config.port),
      String(config.secure),
      config.user,
      config.from,
    ].join("|");
  },

  createTransporter: function () {
    var config = mailHandler.getConfig();

    return nodemailer.createTransport({
      pool: true,
      maxConnections: 1,
      maxMessages: Infinity,
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTLS: !config.secure && config.port === 587,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  },

  getTransporter: function () {
    var config = mailHandler.getConfig();
    var configKey = mailHandler.getConfigKey(config);

    if (cachedTransporter && cachedTransporterKey === configKey) {
      return cachedTransporter;
    }

    cachedTransporter = mailHandler.createTransporter();
    cachedTransporterKey = configKey;

    return cachedTransporter;
  },

  resetTransporter: function () {
    if (cachedTransporter && typeof cachedTransporter.close === "function") {
      try {
        cachedTransporter.close();
      } catch (error) {}
    }

    cachedTransporter = null;
    cachedTransporterKey = "";
    warmupPromise = null;
  },

  warmupTransporter: function () {
    if (warmupPromise) {
      return warmupPromise;
    }

    var transporter: any = mailHandler.getTransporter();

    warmupPromise = transporter
      .verify()
      .then(function () {
        return {
          success: true,
        };
      })
      .catch(function (error) {
        mailHandler.resetTransporter();

        return {
          success: false,
          message: error.message,
        };
      })
      .finally(function () {
        warmupPromise = null;
      });

    return warmupPromise;
  },

  sendMail: async function (mailOptions) {
    try {
      var config = mailHandler.getConfig();
      var transporter: any = mailHandler.getTransporter();
      var info = await transporter.sendMail({
        from: config.from,
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
      mailHandler.resetTransporter();

      return {
        success: false,
        message: error.message,
      };
    }
  },

  sendForgotPasswordMail: async function (email, token) {
    var resetLink = buildFrontendUrl(
      "/reset-password?token=" + encodeURIComponent(token),
    );

    return await mailHandler.sendMail({
      to: email,
      subject: "TEFast - Quen mat khau",
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

  sendVerifyEmailMail: async function (email, token) {
    var verifyLink = mailHandler.buildVerifyEmailUrl(token);

    return await mailHandler.sendMail({
      to: email,
      subject: "TEFast - Xac thuc email",
      html:
        "<p>Cam on ban da dang ky tai khoan TEFast.</p>" +
        "<p>Vui long xac thuc email bang cach bam vao link sau: <a href='" +
        verifyLink +
        "'>" +
        verifyLink +
        "</a></p>",
      text: "Xac thuc email tai khoan: " + verifyLink,
    });
  },
};

module.exports = mailHandler;
