const express = require("express");
const clients = require("../controllers/client.controller");
const multer = require("multer");
const app = require("../../app");
const router = express.Router();

// clients
router.route("/all-brands")
    .get(clients.findAllBrands)
router.route("/all-products")
    .get(clients.findAllProducts)
router.route("/all-products-by-brand/:id")
    .get(clients.findAllProductsByBrand)
router.route("/get-brand/:id")
    .get(clients.getBrand)
router.route("/get-product/:id")
    .get(clients.getProduct)
router.route("/create-order")
    .post(clients.createOrder)
router.route("/user")
    .post(clients.createUser)
router.route("/user/get-info-client")
    .get(clients.getInfoUser)
router.route("/get-orders-by-client/:id")
    .get(clients.getOrdersByClient)
router.route("/user/:id")
    .get(clients.findOne)
    .put(clients.updateUser)

router.route("/user/login")
    .post(clients.login)
router.route("/user/logout")
    .post(clients.logout)
module.exports = router;