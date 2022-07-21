const multer = require('multer');
const path = require('path');

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let user = path.extname(file.originalname);
        if (user !== ".jpg" && user !== ".jpeg" && user !== ".png") {
            cb(new Error("file type is not supported"), false);
            return;
        }
        cb(null, true);
    },
});