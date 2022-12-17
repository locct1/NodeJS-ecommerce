const express = require("express");
const brands = require("../controllers/brand.controller");
const multer = require("multer");
const app = require("../../app");
const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/brands')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});
const MAX_SIZE = 200000
const upload = multer({
    storage: storage
});
// brand 
router.route("/")
    .get(brands.findAll)
    .post(upload.single("image"), brands.create)
    .delete(brands.deleteAll);

router.route("/:id")
    .get(brands.findOne)
    .put(upload.single("image"),brands.update)
    .delete(brands.delete);

router.route("/no-image/:id").put(brands.updateNoImage);

router.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_TYPES") {
        res.status(422).json({ error: "Only images are allowed " });
        return;
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        res.status(422).json({ error: `Too large. Max size is ${MAX_SIZE / 1000}KB` });
        return;
    }
})
module.exports = router;