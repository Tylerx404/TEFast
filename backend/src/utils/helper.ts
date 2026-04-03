var crypto = require("crypto");

var helper = {
  nowIso: function () {
    return new Date().toISOString();
  },

  createId: function (prefix) {
    return prefix + "_" + crypto.randomUUID();
  },

  toPositiveNumber: function (value, fallback) {
    var parsedValue = Number.parseInt(String(value || ""), 10);

    if (Number.isNaN(parsedValue) || parsedValue <= 0) {
      return fallback;
    }

    return parsedValue;
  },

  readPagination: function (query) {
    return {
      page: helper.toPositiveNumber(query && query.page, 1),
      limit: helper.toPositiveNumber(query && query.limit, 10),
    };
  },

  buildPaginationMeta: function (page, limit, total) {
    return {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  sendSuccess: function (response, message, data, meta, statusCode) {
    if (meta === undefined) {
      meta = null;
    }

    if (statusCode === undefined) {
      statusCode = 200;
    }

    response.status(statusCode).json({
      success: true,
      message: message,
      data: data,
      meta: meta,
    });
  },

  sendCreated: function (response, message, data, meta) {
    helper.sendSuccess(response, message, data, meta, 201);
  },

  sendError: function (response, statusCode, message, errors) {
    if (!Array.isArray(errors)) {
      errors = [];
    }

    response.status(statusCode).json({
      success: false,
      message: message,
      errors: errors,
    });
  },
};

module.exports = helper;
