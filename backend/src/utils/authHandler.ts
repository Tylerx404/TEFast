var jwt = require("jsonwebtoken");
var helper = require("./helper");

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
            u.phone,
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
        phone: getUser.rows[0].phone,
        status: String(getUser.rows[0].status || "").toUpperCase(),
        isDeleted: getUser.rows[0].is_deleted,
        role: {
          id: getUser.rows[0].role_id,
          name: String(getUser.rows[0].role_name || "").toUpperCase(),
        },
      };
    } catch (error) {
      return null;
    }
  },

  readToken: function (req) {
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    if (req.headers && req.headers.authorization) {
      var authorizationToken = req.headers.authorization;

      if (!authorizationToken.startsWith("Bearer ")) {
        return null;
      }

      return authorizationToken.split(" ")[1];
    }

    return null;
  },

  tryLoadCurrentUser: async function (req) {
    try {
      var token = authHandler.readToken(req);

      if (!token) {
        return null;
      }

      var result = jwt.verify(token, process.env.JWT_SECRET || "HUTECH");

      if (result.exp * 1000 > Date.now()) {
        req.userId = result.id || result.sub;
        req.currentUser = await authHandler.findUserById(req, req.userId);

        if (
          !req.currentUser ||
          req.currentUser.isDeleted ||
          req.currentUser.status == "BLOCKED"
        ) {
          return null;
        }

        return req.currentUser;
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  checkLogin: async function (req, res, next) {
    var currentUser = await authHandler.tryLoadCurrentUser(req);

    if (!currentUser) {
      helper.sendError(res, 401, "Authentication required");
      return;
    }

    next();
  },

  checkRole: function (...requiredRole) {
    return async function (req, res, next) {
      try {
        var currentUser = req.currentUser;

        if (!currentUser) {
          currentUser = await authHandler.tryLoadCurrentUser(req);
        }

        if (!currentUser) {
          helper.sendError(res, 401, "Authentication required");
          return;
        }

        var roleName = currentUser.role.name;

        if (requiredRole.includes(roleName)) {
          next();
        } else {
          helper.sendError(res, 403, "Forbidden");
        }
      } catch (error) {
        helper.sendError(res, 403, "Forbidden");
      }
    };
  },
};

module.exports = authHandler;
