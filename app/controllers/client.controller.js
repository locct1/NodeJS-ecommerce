const ClientService = require("../services/client.service");
const ImageService = require("../services/image.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { request } = require("../../app");
const { ObjectId, ReturnDocument } = require("mongodb");
const fs = require('fs');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');

// Retrieve allclients of a user from the database
exports.findAllBrands = async (req, res, next) => {
    let documents = [];
    try {
        const clientService = new ClientService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await clientService.findByNameProduct(name);
        } else {
            documents = await clientService.findAllBrands({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurned while retrieving contacts")
        );
    }
    return res.send(documents);
};
exports.findAllProducts = async (req, res, next) => {
    let documents = [];
    try {
        const contactService = new ClientService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await contactService.findByNameProduct(name);
        } else {
            documents = await contactService.findAllProducts({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurned while retrieving contacts")
        );
    }
    return res.send(documents);
};
exports.findAllProductsByBrand = async (req, res, next) => {
    let documents = [];
    try {
        const clientService = new ClientService(MongoDB.client);
        if (req.params.id) {
            documents = await clientService.findAllProductsByBrand(req.params.id);
        } else {
            documents = await clientService.findAllProducts({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurned while retrieving contacts")
        );
    }
    return res.send(documents);
};
exports.getOrdersByClient = async (req, res, next) => {
    let documents = [];
    try {
        const clientService = new ClientService(MongoDB.client);
        documents = await clientService.getOrdersByClient(req.params.id);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurned while retrieving contacts")
        );
    }
    return res.send(documents);
};
exports.getBrand = async (req, res, next) => {
    try {
        const clientService = new ClientService(MongoDB.client);
        const document = await clientService.findBrand(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Contact not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving client with id = ${req.body.code}`
            )
        );
    }
};
exports.getProduct = async (req, res, next) => {
    try {
        const clientService = new ClientService(MongoDB.client);
        const document = await clientService.findProduct(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Contact not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving client with id = ${req.body.code}`
            )
        );
    }
};
// clients/user
exports.createUser = async (req, res, next) => {
    if (!req.body?.name || !req.body?.email || !req.body?.address || !req.body?.phone || !req.body?.password) {
      return  res.status(200).send({
            errCode: 1,
            message: "Các trường không được để trống"
        });
    }
    try {
        const clientService = new ClientService(MongoDB.client);
        const document = await clientService.createUser(req.body);
        data={
            errCode:0,
            message:'Tài khoản đã thêm thành công'
        }
        return res.send(data);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the user")
        );
    }
};
exports.login = async (req, res, next) => {
    if (!req.body?.email || !req.body?.password) {
        return res.status(200).send({
            errCode: 1,
            message: "Các trường không được để trống"
        });
    }
    try {
        const user = await MongoDB.client.db().collection("users").findOne({
            email: req.body.email,
        });
        if (!user) {
            return res.status(200).send({ errCode: 1, message: 'Không tìm thấy hoặc không có quyền truy cập' });
        }
        if (!await bcrypt.compare(req.body.password, user.password)) {
            return res.status(200).send({ errCode: 2, message: 'Mật khẩu không đúng' });
        }
        const token = jwt.sign({ _id: user._id }, "serect");
        res.cookie('jwtClient', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 //1 day
        })
        res.send({
            errCode: 0,
            message: 'success',

        });

    } catch (error) {
        return next(
            new ApiError(500, "Đã có lỗi")
        );
    }
};
exports.logout = async (req, res, next) => {

    try {
        res.cookie('jwtClient', '', {
            maxAge: 0
        })
        res.send({
            message: 'success'
        });


    } catch (error) {
        return next(
            new ApiError(500, "Đã có lỗi")
        );
    }
};
exports.getInfoUser = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwtClient'];
        const claims = jwt.verify(cookie, 'serect');
        if (!claims) {
            return res.status(200).send({
                errCode: 1,
                message: 'unauthenticated'

            });

        }
        const user = await MongoDB.client.db().collection("users").findOne({ _id: new ObjectId(claims._id) })
        delete user.password;
        user.errCode = 0;
        user.message = 'authenticated';
        return res.status(200).send({
            data: user
        });

    } catch (error) {
        return next(
            new ApiError(500, "Đã có lỗi")
        );
    }
};

// Retrieve all users of a user from the database


//  Find a single user with an id
exports.findOne = async (req, res, next) => {
    try {
        const clientService = new ClientService(MongoDB.client);
        const document = await clientService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving user with id = ${req.params.id}`
            )
        );
    }
};
// Update a user by the id in the request
exports.updateUser = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const clientService = new ClientService(MongoDB.client);
        const document = await clientService.updateUser(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "User not found"))
        }
        return res.send({ message: "User was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating user with id = ${req.params.id}`)
        );
    }
};
exports.createOrder = async (req, res, next) => {
    // if (!req.body?.name) {
    //     return next(new ApiError(400, "Name can not be empty"));
    // }
    try {
        const clientService = new ClientService(MongoDB.client);
        const document = await clientService.createOrder(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the product")
        );
    }
};
