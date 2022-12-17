const OrderService = require("../services/order.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { request } = require("../../app");
const fs = require('fs');

// Retrieve all orders of a order from the database
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const orderService = new OrderService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await orderService.findByName(name);
        } else {
            documents = await orderService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurned while retrieving orders")
        );
    }
    return res.send(documents);
};
exports.findOne = async (req, res, next) => {
    console.log(req.params.id)
    try {
        const orderService = new OrderService(MongoDB.client);
        const document = await orderService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Order not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving order with id = ${req.params.id}`
            )
        );
    }
};
exports.changeStatus = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const document = await orderService.changeStatus(req.body._id,req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the order")
        );
    }
};
exports.delete = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const document = await orderService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, " not found"));
        }
        return res.send({ message: " was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete order with id = ${req.params.id}`
            )
        );
    }
};