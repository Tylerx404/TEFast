var fs = require("fs");
var path = require("path");

var uploadHandler = {
  allowedFolders: ["images", "audio", "docs"],

  resolveFolder: function (folder) {
    if (
      typeof folder !== "string" ||
      !uploadHandler.allowedFolders.includes(folder)
    ) {
      return "docs";
    }

    return folder;
  },

  ensureUploadFolder: function (folder) {
    var targetFolder = path.join(__dirname, "../../public/uploads", folder);

    fs.mkdirSync(targetFolder, {
      recursive: true,
    });

    return targetFolder;
  },

  buildStoredFileName: function (originalName) {
    var extension = path.extname(originalName);
    var baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .toLowerCase();

    return baseName + "-" + Date.now() + extension;
  },

  buildFileResponse: function (file, folder) {
    return {
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: "/uploads/" + folder + "/" + file.filename,
    };
  },
};

module.exports = uploadHandler;
