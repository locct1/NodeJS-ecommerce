const express = require("express");
const users = require("../controllers/user.controller");
const multer = require("multer");
const app = require("../../app");
const router = express.Router();
const MAX_SIZE = 200000
router.route("/")
    .get(users.findAll)
    .post(users.create)
    .delete(users.deleteAll);
router.route("/get-info-admin")
    .get(users.getInfoAdmin);

router.route("/:id")
    .get(users.findOne)
    .put(users.update)
    .delete(users.delete);
router.route("/login")
    .post(users.login);
router.route("/logout")
    .post(users.logout);


module.exports = router;