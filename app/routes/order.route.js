const express = require("express");
const orders = require("../controllers/order.controller");
const multer = require("multer");
const app = require("../../app");
const router = express.Router();

// contacts
router.route("/")
    .get(orders.findAll)
router.route("/:id")
    .get(orders.findOne)
    .delete(orders.delete)
router.route("/change-status")
    .post(orders.changeStatus)
module.exports = router;