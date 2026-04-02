var body = require("express-validator").body;
var validationResult = require("express-validator").validationResult;
var util = require("util");

var options = {
  password: {
    minLength: 8,
    minLowercase: 1,
    minSymbols: 1,
    minUppercase: 1,
    minNumbers: 1,
  },
};

var validationHandler = {
  userPostValidation: [
    body("email")
      .notEmpty()
      .withMessage("email khong duoc de trong")
      .bail()
      .isEmail()
      .withMessage("khong phai email"),

    body("password")
      .notEmpty()
      .withMessage("password khong duoc de trong")
      .bail()
      .isStrongPassword(options.password)
      .withMessage(
        util.format(
          "password phai co it nhat %d ki tu, trong do it nhat %d ki tu so",
          options.password.minLength,
          options.password.minNumbers,
        ),
      ),

    body("confirmPassword")
      .notEmpty()
      .withMessage("confirmPassword khong duoc de trong")
      .bail()
      .custom(function (value, { req }) {
        if (value != req.body.password) {
          throw new Error("confirmPassword khong khop");
        }

        return true;
      }),

    body("avatarUrl").optional().isURL().withMessage("avatarUrl phai la URL"),
  ],

  loginValidation: [
    body("email")
      .notEmpty()
      .withMessage("email khong duoc de trong")
      .bail()
      .isEmail()
      .withMessage("khong phai email"),

    body("password").notEmpty().withMessage("password khong duoc de trong"),
  ],

  validateResult: function (req, res, next) {
    var result = validationResult(req);

    if (result.errors.length > 0) {
      res.status(400).send({
        message: result.errors,
      });
      return;
    }

    next();
  },
};

module.exports = validationHandler;
