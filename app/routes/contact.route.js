const express = require("express");
const contacts = require("../controllers/contact.controller");
const brands = require("../controllers/brand.controller");
const multer = require("multer");
const app = require("../../app");
const router = express.Router();

const storage=multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const MAX_SIZE = 200000
const upload = multer({
    storage:storage
});
// contacts
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
// brand 
router.route("/")
    .get(brands.findAll)
    .post(upload.single("image"), brands.create)
    .delete(brands.deleteAll);

router.route("/favorite")
    .get(brands.findAllFavorite);

router.route("/:id")
    .get(brands.findOne)
    .put(brands.update)
    .delete(brands.delete);
router.route("/image")
    .post(upload.single("image"), contacts.image)
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