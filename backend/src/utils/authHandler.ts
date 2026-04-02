var jwt = require("jsonwebtoken");

var authHandler = {
  findUserById: async function (req, userId) {
    try {
      var pool = req.app.locals.pg;

      if (!pool || !userId) {
        return null;
      }

      var getUser = await pool.query(
        `
          SELECT
            u.id,
            u.username,
            u.email,
            u.full_name,
            u.avatar_url,
            u.status,
            u.is_deleted,
            u.role_id,
            r.name AS role_name
          FROM users u
          LEFT JOIN roles r ON r.id = u.role_id
          WHERE u.id = $1
          LIMIT 1
        `,
        [userId],
      );

      if (getUser.rows.length == 0) {
        return null;
      }

      return {
        id: getUser.rows[0].id,
        username: getUser.rows[0].username,
        email: getUser.rows[0].email,
        fullName: getUser.rows[0].full_name,
        avatarUrl: getUser.rows[0].avatar_url,
        status: getUser.rows[0].status,
        isDeleted: getUser.rows[0].is_deleted,
        role: {
          id: getUser.rows[0].role_id,
          name: getUser.rows[0].role_name,
        },
      };
    } catch (error) {
      return null;
    }
  },

  checkLogin: function (req, res, next) {
    try {
      var token;

      if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      } else {
        var authorizationToken = req.headers.authorization;

        if (!authorizationToken || !authorizationToken.startsWith("Bearer")) {
          res.status(403).send({
            message: "ban chua dang nhap",
          });
          return;
        }

        token = authorizationToken.split(" ")[1];
      }

      var result = jwt.verify(token, process.env.JWT_SECRET || "HUTECH");

      if (result.exp * 1000 > Date.now()) {
        req.userId = result.id || result.sub;
        next();
      } else {
        res.status(403).send({
          message: "ban chua dang nhap",
        });
      }
    } catch (error) {
      res.status(403).send({
        message: "ban chua dang nhap",
      });
      return;
    }
  },

  checkRole: function (...requiredRole) {
    return async function (req, res, next) {
      try {
        var userId = req.userId;
        var getUser = await authHandler.findUserById(req, userId);

        if (!getUser) {
          res.status(403).send({
            message: "ban khong co quyen",
          });
          return;
        }

        if (getUser.isDeleted || getUser.status == "BLOCKED") {
          res.status(403).send({
            message: "ban khong co quyen",
          });
          return;
        }

        var roleName = getUser.role.name;

        if (requiredRole.includes(roleName)) {
          req.currentUser = getUser;
          next();
        } else {
          res.status(403).send({
            message: "ban khong co quyen",
          });
        }
      } catch (error) {
        res.status(403).send({
          message: "ban khong co quyen",
        });
      }
    };
  },
};

module.exports = authHandler;
