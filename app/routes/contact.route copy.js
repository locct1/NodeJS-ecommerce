const express = require("express");
const contacts = require("../controllers/contact.controller");
const multer = require("multer");
const app = require("../../app");
const router = express.Router();
const fileFilter = function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error("Wrong file type");
        error.code = "LIMIT_FILE_TYPES";
        return cb(error, false);
    }
    cb(null, true);
}
const MAX_SIZE = 200000
const upload = multer({
    dest: './uploads',
    fileFilter,
    limits: {
        fileSize: MAX_SIZE
    }
});
router.route("/")
    .get(contacts.findAll)
    .post(contacts.create)
    .delete(contacts.deleteAll);

router.route("/favorite")
    .get(contacts.findAllFavorite);

router.route("/:id")
    .get(contacts.findOne)
    .put(contacts.update)
    .delete(contacts.delete);
router.route("/image")
    .post(upload.single('file'), contacts.image)
router.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_TYPES") {
        res.status(422).json({ error: "Only images are allowed " });
        return;
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        res.status(422).json({ error: `Too large. Max size is ${MAX_SIZE/1000}KB` });
        return;
    }
   
})
module.exports = router;